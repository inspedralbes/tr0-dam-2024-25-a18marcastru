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
  fs.readFile('preguntes2.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer el archivo JSON' });
    }

    allQuestions = JSON.parse(data)

    res.json(allQuestions);
  });
});

app.post('/over', (req, res) => {
  //const newObj = aleatorio(obj);
  const pathMainDir = __dirname + "\\Jocs";
  
  const fechaActual = new Date();
  const dia = fechaActual.getDate();
  const mes = fechaActual.getMonth() + 1;
  const year = fechaActual.getFullYear(); 
  const pathDirective = path.join(pathMainDir, `${dia}-${mes}-${year}`);

  if(!fs.existsSync(pathDirective)) {
    fs.mkdir(pathDirective, (err) => {
      if(err) return res.send("Error");
      else return res.send("Creada");
    });
  }
  else res.send("Ya existe");

  // fs.writeFile(pathFile, obj, (err) => {
  //   if(err) return res.status(500).json({mesaje: 'Error al crear archivo'})
  //   res.status(200).json({mensaje: 'Archivo creado'})
  // });
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

app.put('/actualizar/:pregunta', (req, res) => {
  const updateQuestion = req.params.pregunta;

  const updatedQuestionData = req.body;

  // Leemos el archivo JSON
  fs.readFile('preguntes2.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer el archivo JSON' });
    }

    let allQuestions;

    // Parseamos el archivo JSON a objeto JavaScript
    try {
      allQuestions = JSON.parse(data);
    } catch (parseError) {
      return res.status(500).json({ message: 'Error al parsear el archivo JSON' });
    }

    // Buscamos el índice de la pregunta que queremos actualizar
    const index = allQuestions.preguntes.findIndex(p => p.pregunta === updateQuestion);

    if (index !== -1) {
      // Actualizamos la pregunta con los nuevos datos
      allQuestions.preguntes[index] = updatedQuestionData;

      // Convertimos de vuelta a JSON para escribir en el archivo
      const jsonString = JSON.stringify(allQuestions, null, 2);

      // Escribimos el archivo actualizado
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