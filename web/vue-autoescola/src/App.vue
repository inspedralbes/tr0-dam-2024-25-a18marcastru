<script setup>
import { ref, onMounted } from 'vue';

const newObj = ref([])
const preg = ref('preg')

const pregunta = ref('')
const resposta_correcta = ref('')
const url = ref('')
const inc1 = ref('')
const inc2 = ref('')
const inc3 = ref('')

const preguntaOriginal = ref('')

async function fetchPreguntes() {
  try {
    const res = await fetch('http://localhost:3000/start');
    const data =  await res.json();
    newObj.value = data.preguntes;
  } catch (err) {
    console.log("Error", err)
  }
}

function nuevaPregunta(valor, index) {
  preg.value = valor;

  pregunta.value = ""
  resposta_correcta.value = ""
  inc1.value = ""
  inc2.value = ""
  inc3.value = ""

  if(preg.value === 'edit') {
    preguntaOriginal.value = index.pregunta
    pregunta.value = index.pregunta
    resposta_correcta.value = index.resposta_correcta
    inc1.value = index.respostes_incorrectes[0]
    inc2.value = index.respostes_incorrectes[1]
    inc3.value = index.respostes_incorrectes[2]
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

async function acutalizarPregunta() {
  console.log(preguntaOriginal.value)
  const newData = [inc1.value, inc2.value, inc3.value];

  const updateQuestion = {
    pregunta: pregunta.value,
    resposta_correcta: resposta_correcta.value,
    respostes_incorrectes: newData,
    imatge: url.value
  }

  console.log(updateQuestion)

  const res = await fetch(`http://localhost:3000/actualizar/${preguntaOriginal}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateQuestion)
  })
  const data = await res.json();
  console.log(data.message);
  fetchPreguntes();
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
    <button @click="nuevaPregunta('afegir')">Nova pregunta</button>
    <button @click="nuevaPregunta('preg')">Llista de preguntes</button>
    <br><br>
    <div id="novesPreguntes" v-if="preg === 'afegir'">
      <h1>Nueva pregunta</h1>
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
    <div id="preguntes" v-for="index in newObj" :key="index" v-if="preg === 'preg'">
      <h2>{{ index.pregunta }}</h2>
      <ul>
        <li>Resposta correcta: {{ index.resposta_correcta }}</li>
        <li v-for="(resposta_incorrecta, i) in index.respostes_incorrectes" :key="i">
          Resposta incorrecta: {{ resposta_incorrecta }}
          <br>
        </li>
      </ul>
      <p>URL de l'imatge: {{ index.imatge }}</p>
      <br>
      <button @click="eliminarPregunta(index)">Eliminar</button><button @click="nuevaPregunta('edit', index)">Editar</button>
      <br><br>
    </div>
    <div v-if="preg === 'edit'">
      <h1>Editar</h1>
      <br>
      <p>Pregunta: </p>
      <textarea v-model="pregunta" :id="pregunta" rows="4" cols="50" :placeholder="pregunta"></textarea>
      <br>
      <p>Resposta correcta: </p>
      <textarea v-model="resposta_correcta" rows="1" cols="50" :placeholder="resposta_correcta"></textarea>
      <br>
      <p>Respostes incorrectes: </p>
      <ul>
        <li><textarea v-model="inc1" rows="1" cols="20" :placeholder="inc1"></textarea></li>
        <li><textarea v-model="inc2" rows="1" cols="20" :placeholder="inc2"></textarea></li>
        <li><textarea v-model="inc3" rows="1" cols="20" :placeholder="inc3"></textarea></li>
      </ul>
      <button @click="acutalizarPregunta()">Actualizar</button>
    </div>
  </main>
</template>

<style scoped>

</style>
