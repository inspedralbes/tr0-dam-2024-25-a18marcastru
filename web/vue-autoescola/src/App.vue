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

async function fetchPreguntes() {
  try {
    const res = await fetch('http://localhost:3000/start');
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
}

async function eliminarPregunta(pregunta) {
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
  const newData = [inc1.value, inc2.value, inc3.value];

  const updateQuestion = {
    pregunta_original: preguntaOriginal.value,
    pregunta: pregunta.value,
    resposta_correcta: resposta_correcta.value,
    respostes_incorrectes: newData,
    imatge: url.value
  }

  const res = await fetch(`http://localhost:3000/actualizar`, {
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
    <button @click="opcions('start')">Llista de preguntes</button>
  </div>
  <br>
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
  <div class="preguntes" v-for="index in newObj" :key="index" v-if="preg === 'start'">
    <h2>{{ index.pregunta }}</h2>
    <ul>
      <li>Resposta correcta: {{ index.resposta_correcta }}</li>
      <li v-for="(resposta_incorrecta, i) in index.respostes_incorrectes" :key="i">
        Resposta incorrecta: {{ resposta_incorrecta }}
        <br>
      </li>
    </ul>
    <img :src="index.imatge" alt="Imatge">
    <br>
    <div class="botones">
      <button @click="eliminarPregunta(index)">Eliminar</button>
      <button @click="opcions('edit', index)">Editar</button>
    </div>
    <br><br>
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
    <p>Respostes incorrectes: </p>
    <ul>
      <li><input v-model="inc1" :placeholder="inc1"></li>
      <li><input v-model="inc2" :placeholder="inc2"></li>
      <li><input v-model="inc3" :placeholder="inc3"></li>
    </ul>
    <br>
    <button @click="acutalizarPregunta()">Actualizar</button>
  </div>
</template>

<style scoped>
  .preguntes {
    /* display: grid; */
    border-style: solid;
    padding: 5%;
  }
  .botones {
    text-align: center;
  }
  button {
    padding: 10px;
  }
</style>
