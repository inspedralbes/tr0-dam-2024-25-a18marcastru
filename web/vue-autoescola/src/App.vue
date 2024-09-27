<script setup>
import { ref, onMounted } from 'vue';

const newObj = ref([]);
const edit = ref('true');

const pregunta = ref('');
const resposta_correcta = ref('')
const url = ref('')
const inc1 = ref('')
const inc2 = ref('')
const inc3 = ref('')

async function fetchPreguntes() {
  try {
    const res = await fetch('http://localhost:3000/start');
    const data =  await res.json();
    newObj.value = data.preguntes;
  } catch (err) {
    console.log("Error", err)
  }
}

async function eliminarPregunta(pregunta) {
  //newObj.value = newObj.value.filter(p => p !== pregunta);
  try {
    const res = await fetch('http://localhost:3000/eliminar', {
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

  const res = await fetch('http://localhost:3000/afegir', {
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

async function acutalizarPregunta(pregunta) {
  
}

onMounted(() => {
  fetchPreguntes();
})
</script>

<template>
  <header>
    <h1>Autoescola</h1>
  </header>

  <main>
    <div id="novesPreguntes">
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
    <br>
    <div id="preguntes" v-for="index in newObj" :key="index">
      <h2 v-if="edit">{{ index.pregunta }}</h2>
      <input v-else type="text" :placeholder="index.pregunta">
      <ul>
        <li> {{ index.resposta_correcta }}</li>
        <li v-for="(resposta, i) in index.respostes_incorrectes" :key="i">
          {{ resposta }}
          <br>
        </li>
      </ul>
      <input type="text" :placeholder="index.imatge">
      <br>
      <button @click="eliminarPregunta(index)">Eliminar</button><button @click="acutalizarPregunta(index)">Acutalizar</button>
      <br><br>
    </div>
  </main>
</template>

<style scoped>

</style>
