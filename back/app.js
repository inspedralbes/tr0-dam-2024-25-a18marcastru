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

    const resultatsTotal = resultats(resposta_usuari, preguntes_session)
    res.json(resultatsTotal)
  }
});

app.delete('/eliminar', (req, res) => {
  const deleteQuestion = req.body.pregunta;

  allQuestions.preguntes = allQuestions.preguntes.filter(p => 
    p.pregunta !== deleteQuestion
  );

  const jsonString = JSON.stringify(allQuestions, null, 2);

  fs.writeFile("preguntes1.json", jsonString, (err) => {
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

app.put('/actualizar', (req, res) => {
  const updatedQuestionData = req.body;

  fs.readFile('preguntes2.json', 'utf8', (err, data) => {
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
        imatge: ""
      }

      allQuestions.preguntes[index] = newUpdatedQuestionData;

      const jsonString = JSON.stringify(allQuestions, null, 2);

      fs.writeFile('preguntes2.json', jsonString, (writeErr) => {
        if (writeErr) {
          console.error("Error al escribir el archivo:", writeErr);
          return res.status(500).json({ message: 'Error al escribir el archivo JSON' });
        } else {
          res.json({ message: "Pregunta actualizada exitosamente." });
        }
      });
    } else {
      // Si la pregunta no se encuentra, enviamos un error
      res.status(404).json({ message: 'Pregunta no encontrada' });
    }
  });
})

app.get('/grafiques', (req, res) => {
  const pathDirGraphic = path.join(__dirname, 'Grafiques');  // Asegurar que la ruta sea correcta

  // Obtener la fecha actual en formato día-mes-año
  const fechaActual = new Date().toLocaleDateString('es-ES').replace(/\//g, '-'); // Formato 'dd-mm-aaaa'

  // Pasar la fecha al script de Python
  const pythonProcess = spawn('py', ['generate_graph.py', fechaActual]);

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Error del script de Python: ${data.toString()}`);
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Salida del script: ${data.toString()}`);
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).send(`El proceso Python finalizó con el código ${code}`);
    }

    const imagePath = path.join(pathDirGraphic, `${fechaActual}.png`);  // Usar el nombre de archivo con fecha
    console.log(`Buscando la imagen en: ${imagePath}`);
    
    // Verificar que el archivo exista antes de enviarlo
    if (!fs.existsSync(imagePath)) {
      return res.status(404).send('La gráfica no existe.');
    }

    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error(`Error al enviar la gráfica: ${err}`);
        res.status(500).send('Error al enviar la gráfica.');
      }
    });
  });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});