<script setup>
import { ref, onMounted } from 'vue';

const newObj = ref([])
const preg = ref('start')

const pregunta = ref('')
const resposta_correcta = ref('')
const url = ref('')
const inc1 = ref('')
const inc2 = ref('')
const inc3 = ref('')

const preguntaOriginal = ref('')

const esta = ref('')

async function fetchPreguntes() {
  try {
    const res = await fetch('http://dam.inspedralbes.cat:20999');
    const data =  await res.json();
    newObj.value = data.preguntes;
  } catch (err) {
    console.log("Error", err)
  }
}

function opcions(valor, index) {
  preg.value = valor;

  pregunta.value = ""
  resposta_correcta.value = ""
  inc1.value = ""
  inc2.value = ""
  inc3.value = ""

  if(valor === 'edit') {
    preguntaOriginal.value = index.pregunta
    pregunta.value = index.pregunta
    resposta_correcta.value = index.resposta_correcta
    inc1.value = index.respostes_incorrectes[0]
    inc2.value = index.respostes_incorrectes[1]
    inc3.value = index.respostes_incorrectes[2]
  }

  if(valor === 'esta') estadistiques()
}

async function eliminarPregunta(pregunta) {
  try {
    const res = await fetch('http://dam.inspedralbes.cat:20999/eliminar', {
      method: 'DELETE',
      headers: {
        'content-Type': 'application/json'
      },
      body: JSON.stringify({pregunta: pregunta.pregunta})
    });
    const data = await res.json();
    console.log(data.message);
    fetchPreguntes();
  } catch (err) {
    console.log("Error", err);
  }
}

async function afegir() {
  const newData = [inc1.value, inc2.value, inc3.value];

  const newQuestion = {
    pregunta: pregunta.value,
    resposta_correcta: resposta_correcta.value,
    respostes_incorrectes: newData,
    imatge: url.value
  }

  const res = await fetch('http://dam.inspedralbes.cat:20999/afegir', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newQuestion)
  })
  const data = await res.json();
  console.log(data.message);
  fetchPreguntes();
}

async function actualitzaPregunta() {
  const newData = [inc1.value, inc2.value, inc3.value];

  const updateQuestion = {
    pregunta_original: preguntaOriginal.value,
    pregunta: pregunta.value,
    resposta_correcta: resposta_correcta.value,
    respostes_incorrectes: newData,
    imatge: url.value
  }

  const res = await fetch(`http://dam.inspedralbes.cat:20999/actualizar`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateQuestion)
  })
  const data = await res.json();
  console.log(data.message);
  opcions('edit',updateQuestion)
  fetchPreguntes();
}

async function estadistiques() {
  try {
    const res = await fetch('http://dam.inspedralbes.cat:20999/estadistica')
    const data =  await res.json();
    esta.value = data;
  } catch (err) {
    console.log("Error", err)
  }
}

onMounted(() => {
  fetchPreguntes();
})
</script>

<template>
  <header>
    <h1>Menu de preguntes</h1>
  </header>
  <br>
  <div>
    <button @click="opcions('afegir')">Nova pregunta</button>
    <button @click="opcions('llista')">Llista de preguntes</button>
    <!-- <button @click="opcions('esta')">Estadistiques</button> -->
  </div>
  <br>
  <div class="preguntes" v-for="index in newObj" :key="index" v-if="preg === 'llista'">
    <h2>{{ index.pregunta }}</h2>
    <br>
    <img :src="index.imatge" alt="Imatge">
    <br>
    <ul>
      <li>Resposta correcta: {{ index.resposta_correcta }}</li>
      <li v-for="(resposta_incorrecta, i) in index.respostes_incorrectes" :key="i">
        Resposta incorrecta: {{ resposta_incorrecta }}
        <br>
      </li>
    </ul>
    <br>
    <div class="botones">
      <button @click="eliminarPregunta(index)">Eliminar</button>
      <button @click="opcions('edit', index)">Editar</button>
    </div>
    <br><br>
  </div>
  <div id="novesPreguntes" v-if="preg === 'afegir'">
    <h1>Nova pregunta</h1>
    <input v-model="pregunta" placeholder="Pregunta">
    <br>
    <input v-model="resposta_correcta" placeholder="Resposta correcta">
    <br>
    <input v-model="inc1" placeholder="Resposta incorrecta">
    <br>
    <input v-model="inc2" placeholder="Resposta incorrecta">
    <br>
    <input v-model="inc3" placeholder="Resposta incorrecta">
    <br>
    <input v-model="url" placeholder="URL">
    <br>
    <button @click="afegir()">Afegir</button>
  </div>
  <div v-if="preg === 'edit'">
    <br>
    <h1>Editar</h1>
    <p>Pregunta: </p>
    <textarea v-model="pregunta" rows="2" cols="50" :placeholder="pregunta"></textarea>
    <br>
    <p>Resposta correcta: </p>
    <input v-model="resposta_correcta" :placeholder="resposta_correcta">
    <br>
    <p>URL:</p>
    <input v-model="url" :placeholder="url">
    <br>
    <p>Respostes incorrectes: </p>
    <ul>
      <li><input v-model="inc1" :placeholder="inc1"></li>
      <li><input v-model="inc2" :placeholder="inc2"></li>
      <li><input v-model="inc3" :placeholder="inc3"></li>
    </ul>
    <br>
    <button @click="actualitzaPregunta()">Actualizar</button>
  </div>
  <div v-if="preg === 'esta'">
    <h1>Estadistiques</h1>
    <br>
  </div>
</template>

<style scoped>
  body {
    font-family: Arial;
  }

  header {
    text-align: center;
    background-color: #007bff;
    padding: 20px;
    border-radius: 5px;
  }

  .preguntes {
    border: 2px solid #007bff;
    border-radius: 8px;
    padding: 20px;
    margin: 20px;
  }

  img {
    width: 100%;
    max-width: 300px;
    height: auto;
    margin-top: 10px;
  }

  button {
    background-color: #007bff;
    border: none;
    padding: 10px 20px;
    margin: 5px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #0056b3;
    color: #ffffff;
  }

  .botones {
    display: flex;
    justify-content: space-around;
    margin-top: 10px;
  }

  input, textarea {
    width: 100%;
    padding: 10px;
    margin: 5px 0;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
  }

  #novesPreguntes {
    background-color: #e9ecef;
    border: 2px solid #007bff;
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  h1 {
    color: black;
  }

  input textarea {
    margin-bottom: 15px;
  }

  ul {
    list-style-type: none;
    padding-left: 0;
  }

  ul li {
    background-color: #f8f9fa;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
  }

  .preguntes button {
    width: 45%;
  }
</style>
