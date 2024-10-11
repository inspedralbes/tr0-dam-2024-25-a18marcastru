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

  while(preguntes.length > 0) {
    const randomIndex = Math.floor(Math.random() * preguntes.length);
    numQ.push(preguntes[randomIndex]);
    preguntes.splice(randomIndex, 1);
  }

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

function getMySessionId(sessionId, result){
  if(!sessionId){
    sessionId = uuidv4();
    let obj = {};
    obj.sessionId = sessionId;
    obj.data = result;
    mySessions[sessionId] = obj;
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


/*
app.get('/start', (req, res) => {
  fs.readFile('preguntes.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer el archivo JSON' });
    }
    
    allQuestions = JSON.parse(data)

    const result = random(allQuestions)

    res.json(result);
  });
});
*/

function resultats(resposta_usuari, allQuestions) {
  let res_cor = 0
  let res_inc = 0

  resposta_usuari.forEach(item => {
    const pregunta = item.pregunta
    const resposta = item.resposta

    const questionIndex = allQuestions.preguntes.findIndex(q => q.pregunta.trim() === pregunta.trim());
    if (questionIndex !== -1) {
      if (allQuestions.preguntes[questionIndex].resposta_correcta === resposta) res_cor++;
      else res_inc++;
    }
  });

  const resultats = {
    correctes: res_cor,
    incorrectes: res_inc
  }

  console.log(resultats)

  return resultats
}

app.post('/over', (req, res) => {
  const resposta_usuari = req.body
  const pathMainDir = __dirname + "\\Jocs";

  console.log(mySessions)

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

  const filePath = path.join(pathDirective, "Respostes_usuaris.json")
  const pathRespostes_usuarisOriginal = path.join(pathMainDir, "Respostes_usuarisOriginal.json")
  
  if(!fs.existsSync(filePath)) {
    resposta_usuari.forEach(item => {
      const pregunta = item.pregunta
      const resposta = item.resposta
      const questionIndex = jsonData.preguntes.findIndex(q => q.pregunta.trim() === pregunta.trim());

      if (questionIndex !== -1) {
        const answerIndex = jsonData.preguntes[questionIndex].resposta_usuaris.findIndex(a => a.resposta.trim() === resposta.trim());
        console.log(answerIndex)
        if (answerIndex !== -1) {
          jsonData.preguntes[questionIndex].resposta_usuaris[answerIndex].contador += 1; // Incrementar contador
        }
      }
    });
    
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2))
    console.log("Actualizado")
  }
  else {
    // resposta_usuari.forEach(item => {
    //   const pregunta = item.pregunta
    //   const resposta = item.resposta

    //   const questionIndex = jsonData.preguntes.findIndex(q => q.pregunta.trim() === pregunta.trim());
    //   console.log(questionIndex)
    //   if (questionIndex !== -1) {
    //     const answerIndex = jsonData.preguntes[questionIndex].resposta_usuaris.findIndex(a => a.resposta.trim() === resposta.trim());
    //     console.log(answerIndex)
    //     if (answerIndex !== -1) {
    //       jsonData.preguntes[questionIndex].resposta_usuaris[answerIndex].contador += 1; // Incrementar contador
    //     }
    //   }
    // });

    // fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2))
    // console.log("Actualizado")
  }

  /*
  

  const resultatsTotal = resultats(resposta_usuari, jsonData)
  res.json(resultatsTotal)
  */
})

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

  fs.readFile('preguntes.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer el archivo JSON' });
    }

    let allQuestions;

    try {
      allQuestions = JSON.parse(data);
    } catch (parseError) {
      return res.status(500).json({ message: 'Error al parsear el archivo JSON' });
    }

    console.log(updatedQuestionData.pregunta_original)

    const index = allQuestions.preguntes.findIndex(p => p.pregunta.trim() === updatedQuestionData.pregunta_original.trim());

    console.log(index)

    if (index !== -1) {
      const newUpdatedQuestionData = {
        pregunta: updatedQuestionData.pregunta,
        resposta_correcta: updatedQuestionData.resposta_correcta,
        respostes_incorrectes: updatedQuestionData.respostes_incorrectes,
        imatge: ""
      }

      allQuestions.preguntes[index] = newUpdatedQuestionData;

      const jsonString = JSON.stringify(allQuestions, null, 2);

      fs.writeFile('preguntes.json', jsonString, (writeErr) => {
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

app.get('/estadistica', (req, res) => {
  const pathDirGraphic = __dirname + "\\Grafiques"
  const pythonProcess = spawn('py', ['generate_graph.py']);

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

    const imagePath = path.join(pathDirGraphic, 'graph_1.png');
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