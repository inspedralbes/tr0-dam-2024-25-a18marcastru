const express = require('express');
const app = express();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');
const port = 20000;

app.use(cors());
app.use(express.json())

let allQuestions;
let mySessions = []

app.get('/', (req, res) => {
  fs.readFile('preguntes.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer el archivo JSON' });
    }

    allQuestions = JSON.parse(data)

    res.json(allQuestions);
  });
});

function random(jsonData, sessionId) {

  let numQ = [];
  const preguntes = jsonData.preguntes;

  if (!mySessions[sessionId]) {
    // Si la sesión no existe, generar preguntas aleatorias y crear la sesión
    while (preguntes.length > 0) {
      const randomIndex = Math.floor(Math.random() * preguntes.length);
      numQ.push(preguntes[randomIndex]);
      preguntes.splice(randomIndex, 1);
    }

    // Crear la nueva sesión
    let obj = {
      sessionId: sessionId,
      data: numQ
    };
    mySessions[sessionId] = obj;
  } else {
    // Si la sesión ya existe, reutilizar las preguntas ya almacenadas
    numQ = mySessions[sessionId].data;
  }

  // Crear el nuevo JSON con la sesión
  const newJson = {
    token: sessionId,
    preguntes: numQ.map(q => ({
      pregunta: q.pregunta,
      respostes: mezclarRespuestas(q.resposta_correcta, q.respostes_incorrectes),
      imatge: q.imatge
    }))
  };

  return newJson;

}

function mezclarRespuestas(resposta_correcta, respostes_incorrectes) {
  const respuestas = [resposta_correcta, ...respostes_incorrectes];
  return respuestas.sort(() => Math.random() - 0.5); // Mezcla aleatoria de respuestas
}

function getMySessionId(sessionId, allQuestions){
  if(!sessionId){
    sessionId = uuidv4();
    return random(allQuestions, sessionId)
  }
}

app.get('/start', (req, res) => {
  fs.readFile('preguntes.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer el archivo JSON' });
    }
    
    allQuestions = JSON.parse(data)

    const result = getMySessionId(req.query["sessionId"], allQuestions);

    res.json(result);
  });
});

function resultats(resposta_usuari, allQuestions) {
  let res_cor = 0
  let res_inc = 0

  const { respostes } = resposta_usuari

  for (let i = 0; i < allQuestions.length; i++) {
    if (respostes[i] !== undefined) {
      const preguntaActual = allQuestions[i];
      if (preguntaActual.resposta_correcta === respostes[i]) res_cor++;
      else res_inc++;
    }
  }

  const resultats = {
    correctes: res_cor,
    incorrectes: res_inc
  }
  
  return resultats
}

app.post('/over', (req, res) => {
  const resposta_usuari = req.body
  const pathMainDir = path.join(__dirname + "\\Jocs");
  const preguntes_session = mySessions[resposta_usuari.token].data

  const fechaActual = new Date();
  const dia = fechaActual.getDate();
  const mes = fechaActual.getMonth() + 1;
  const year = fechaActual.getFullYear(); 
  const pathDirective = path.join(pathMainDir, `${dia}-${mes}-${year}`);

  if(!fs.existsSync(pathDirective)) {
    fs.mkdir(pathDirective, (err) => {
      if(err) console.log("Error");
      else console.log("Creada");
    });
  }
  else console.log("Ya existe");

  const pathRespostes_usuarisBase = path.join(pathMainDir, "Respostes_usuarisBase.json")
  const filePath = path.join(pathDirective, "Respostes_usuaris.json")
  const jsonData = JSON.parse(fs.readFileSync(pathRespostes_usuarisBase, 'utf8'));
  const arrIndex = []

  // Verificar si el archivo ya existe o no
  if (!fs.existsSync(filePath)) {
    preguntes_session.forEach(i => {
      const index = jsonData.preguntes.findIndex(q => q.pregunta === i.pregunta);
      arrIndex.push(index);
    });
  
    resposta_usuari.respostes.forEach((item, idx) => {
      if (arrIndex[idx] !== -1) {
        const pregunta = jsonData.preguntes[arrIndex[idx]];
        const answerIndex = pregunta.resposta_usuaris.findIndex(a => a.resposta === item);
        if (answerIndex !== -1) {
          pregunta.resposta_usuaris[answerIndex].contador += 1; // Incrementar contador
        }
      }
    });

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2))
    console.log("Actualizado")
  } else {
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    preguntes_session.forEach(i => {
      const index = jsonData.preguntes.findIndex(q => q.pregunta === i.pregunta);
      arrIndex.push(index);
    });
  
    resposta_usuari.respostes.forEach((item, idx) => {
      if (arrIndex[idx] !== -1) {
        const pregunta = jsonData.preguntes[arrIndex[idx]];
        const answerIndex = pregunta.resposta_usuaris.findIndex(a => a.resposta === item);
        if (answerIndex !== -1) {
          pregunta.resposta_usuaris[answerIndex].contador += 1; // Incrementar contador
        }
      }
    });

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2))
    console.log("Actualizado")
  }

  const resultatsTotal = resultats(resposta_usuari, preguntes_session)
  console.log(resultatsTotal)
  res.json(resultatsTotal)
});

app.delete('/eliminar', (req, res) => {
  const deleteQuestion = req.body.pregunta;

  allQuestions.preguntes = allQuestions.preguntes.filter(p => 
    p.pregunta !== deleteQuestion
  );

  const jsonString = JSON.stringify(allQuestions, null, 2);

  fs.writeFile("preguntes.json", jsonString, (err) => {
    if (err) console.error("Error", err);
    else console.log("Archivo sobrescrito");
  });
  res.json({message: "Eliminado"});
});

app.post('/afegir', (req, res) => {
  const newQuestion = req.body;

  fs.readFile('preguntes.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer el archivo JSON' });
    }

    console.log(newQuestion)

    let allQuestions;

    allQuestions = JSON.parse(data)

    allQuestions.preguntes.push(newQuestion);

    const jsonString = JSON.stringify(allQuestions, null, 2);

    fs.writeFile('preguntes.json', jsonString, (writeErr) => {
      if (writeErr) {
        console.error("Error al escribir el archivo:", writeErr);
      } else {
        res.json({message: "Nueva pregunta añadida exitosamente."});
      }
    });
  });
});

app.put('/actualitzar', (req, res) => {
  const updatedQuestionData = req.body;

  fs.readFile('preguntes.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer el archivo JSON' });
    }

    const allQuestions = JSON.parse(data);

    const index = allQuestions.preguntes.findIndex(p => p.pregunta.trim() === updatedQuestionData.pregunta_original.trim());

    if (index !== -1) {
      const newUpdatedQuestionData = {
        pregunta: updatedQuestionData.pregunta,
        resposta_correcta: updatedQuestionData.resposta_correcta,
        respostes_incorrectes: updatedQuestionData.respostes_incorrectes,
        imatge: updatedQuestionData.imatge
      }

      allQuestions.preguntes[index] = newUpdatedQuestionData;

      const jsonString = JSON.stringify(allQuestions, null, 2);

      fs.writeFile('preguntes.json', jsonString, (writeErr) => {
        if (writeErr) {
          console.error("Error al escribir el archivo:", writeErr);
        } else {
          res.json({ message: "Pregunta actualizada exitosamente." });
        }
      });
    } else {
      // Si la pregunta no se encuentra, enviamos un error
      console.log('Pregunta no encontrada')
    }
  });

  const pathJson = path.join(__dirname, "Jocs", "Respostes_usuarisBase.json");

  // fs.readFile(pathJson, 'utf8', (err, data) => {
  //   if (err) {
  //     return res.status(500).json({ message: 'Error al leer el archivo JSON2' });
  //   }

  //   const allQuestions = JSON.parse(data);

  //   // Encontrar el índice de la pregunta a actualizar
  //   const index = allQuestions.preguntes.findIndex(p => p.pregunta.trim() === updatedQuestionData.pregunta_original.trim());

  //   if (index !== -1) {
  //     // Crear la nueva estructura de pregunta
  //     const newUpdatedQuestionData = {
  //       pregunta: updatedQuestionData.pregunta,
  //       resposta_correcta: updatedQuestionData.resposta_correcta,
  //       resposta_usuaris: updatedQuestionData.resposta_usuaris, // Esto incluye la estructura correcta de respuestas de los usuarios
  //       imatge: updatedQuestionData.imatge || ""  // Campo para imagen (opcional)
  //     };

  //     // Reemplazar la pregunta en el índice encontrado
  //     allQuestions.preguntes[index] = newUpdatedQuestionData;

  //     // Convertir el objeto actualizado a JSON
  //     const jsonString = JSON.stringify(allQuestions, null, 2);

  //     // Escribir el archivo actualizado
  //     fs.writeFile(pathJson, jsonString, (writeErr) => {
  //       if (writeErr) {
  //         console.error("Error al escribir el archivo:", writeErr);
  //         return res.status(500).json({ message: 'Error al escribir el archivo JSON' });
  //       } else {
  //         res.json({ message: "Pregunta actualizada exitosamente." });
  //       }
  //     });
  //   } else {
  //     // Si no se encuentra la pregunta, enviar un mensaje de error
  //     res.status(404).json({ message: 'Pregunta no encontrada' });
  //   }
  // });
})

app.get('/grafiques', (req, res) => {
  const pathDirGraphic = path.join(__dirname, 'Grafiques');  // Asegurar que la ruta sea correcta

  // Obtener la fecha actual en formato día-mes-año
  const fechaActual = new Date().toLocaleDateString('es-ES').replace(/\//g, '-'); // Formato 'dd-mm-aaaa'

  // Ejecutar el script de Python que genera las gráficas
  const pythonProcess = spawn('py', ['generate_graph.py', fechaActual]);

  // Capturar errores del proceso Python
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Error del script de Python: ${data.toString()}`);
  });

  // Capturar la salida del proceso Python (si es necesario)
  pythonProcess.stdout.on('data', (data) => {
    console.log(`Salida del script: ${data.toString()}`);
  });

  // Cuando el script de Python termina de ejecutarse
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).send(`El proceso Python finalizó con el código ${code}`);
    }

    // Leer todas las imágenes generadas en el directorio 'Grafiques'
    fs.readdir(pathDirGraphic, (err, files) => {
      if (err) {
        return res.status(500).json({ message: 'Error al leer el directorio de gráficos' });
      }

      // Filtrar solo los archivos que coinciden con la fecha actual y que son imágenes (ej. PNG)
      const imageFiles = files.filter(file => file.startsWith(fechaActual) && file.endsWith('.png'));

      if (imageFiles.length === 0) {
        return res.status(404).json({ message: 'No se encontraron gráficos' });
      }

      // Generar las URLs de todas las imágenes
      const imageUrls = imageFiles.map(file => `http://localhost:20000/grafiques/${file}`);

      // Enviar la lista de URLs de las imágenes generadas
      res.json({ images: imageUrls });
    });
  });
});

// Ruta para servir los archivos estáticos de la carpeta 'Grafiques'
app.use('/grafiques', express.static(path.join(__dirname, 'Grafiques')));



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});