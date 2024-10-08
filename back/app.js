const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const port = 3000;

app.use(cors());
app.use(express.json())

let allQuestions;

app.get('/start', (req, res) => {
  fs.readFile('questions.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer el archivo JSON' });
    }

    allQuestions = JSON.parse(data)

    res.json(allQuestions);
  });
});

app.post('/over', (req, res) => {
  console.log(req.body)
  const pathMainDir = __dirname + "\\Jocs";
  const pathRespostes_usuaris = path.join(pathMainDir, "Respostes_usuarisOriginal.json")
  
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

  if(!fs.existsSync(filePath)) {
    const jsonData = JSON.parse(fs.readFileSync(pathRespostes_usuaris));

    // Buscar la pregunta y actualizar el contador de la respuesta del usuario
    const questionIndex = jsonData.questions.findIndex(q => q.question === question);
    if (questionIndex !== -1) {
      const answerIndex = jsonData.questions[questionIndex].answer_users.findIndex(a => a.answer === userAnswer);
      if (answerIndex !== -1) {
        jsonData.questions[questionIndex].answer_users[answerIndex].counter += 1; // Incrementar contador
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2))
    console.log("Actualizado")
  }
  else {
    
  }

  fs.writeFile(pathFile, obj, (err) => {
    if(err) return res.status(500).json({mesaje: 'Error al crear archivo'})
    res.status(200).json({mensaje: 'Archivo creado'})
  });
})

app.delete('/eliminar', (req, res) => {
  const deleteQuestion = req.body.pregunta;

  allQuestions.preguntes = allQuestions.preguntes.filter(pregunta => 
    pregunta.pregunta !== deleteQuestion
  );

  const jsonString = JSON.stringify(allQuestions, null, 2);

  fs.writeFile("preguntes2.json", jsonString, (err) => {
    if (err) console.error("Error", err);
    else console.log("Archivo sobrescrito");
  });
  res.json({message: "Eliminado"});
});

app.post('/afegir', (req, res) => {
  const newQuestion = req.body;

  fs.readFile('preguntes2.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer el archivo JSON' });
    }

    console.log(newQuestion)

    let allQuestions;

    allQuestions = JSON.parse(data)

    allQuestions.preguntes.push(newQuestion);

    const jsonString = JSON.stringify(allQuestions, null, 2);

    fs.writeFile('preguntes2.json', jsonString, (writeErr) => {
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

    let allQuestions;

    try {
      allQuestions = JSON.parse(data);
    } catch (parseError) {
      return res.status(500).json({ message: 'Error al parsear el archivo JSON' });
    }

    console.log(updatedQuestionData.pregunta_original)

    const index = allQuestions.preguntes.findIndex(p => p.pregunta === updatedQuestionData.pregunta_original);

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// function random(jsonData) {

//   // let numQ = [];
//   questions2 = jsonData.preguntes;

//   const newJson = questions2.map(q => ({
//     pregunta: q.pregunta,
//     respostes: mezclarRespuestas(q.resposta_correcta, q.respostes_incorrectes),
//     imatge: q.imatge
//   }));

//   // for(let i = 0;i < questions2.length;i++) {
//   //     numQ[i] = questions[Math.floor(Math.random() * questions.length)];
//   // }

//   // const newJson = numQ.map(q => ({
//   //     pregunta: q.pregunta,
//   //     respostes: mezclarRespuestas(q.resposta_correcta, q.respostes_incorrectes),
//   //     imatge: q.imatge
//   // }));

//   return newJson;
// }

// function mezclarRespuestas(resposta_correcta, respostes_incorrectes) {
//   const respuestas = [resposta_correcta, ...respostes_incorrectes];
//   return respuestas.sort(() => Math.random() - 0.5); // Mezcla aleatoria de respuestas
// }