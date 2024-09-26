<script setup>
import { ref, onMounted } from 'vue';

const newObj = ref([]);
const text = ref('');
const newQuestion = ref([]);

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
  newObj.value = newObj.value.filter(p => p !== pregunta);

  console.log(newObj.value)
  try {
    const res = await fetch('http://localhost:3000/eliminar', {
      method: 'DELETE',
      headers: {
        'content-Type': 'application/json'
      },
      body: JSON.stringify({preguntes: newObj.value})
    });
    const data = await res.json();
    console.log(data)
  } catch (err) {
    console.log("Error", err);
  }
}

function onInput(e) {
  return newObj.value.pregunta = e.target.value;
}

async function acutalizarPregunta(pregunta) {
  newQuestion = onInput(e);
  
  console.log(newQuestion)
}

onMounted(() => {
  fetchPreguntes()
})

</script>

<template>
  <header>
    <h1>Autoescola</h1>
  </header>
  <br>

  <main>
    <div id="preguntes" v-for="index in newObj" :key="index">
      <input class="titulo" :value="text" @input="onInput" :placeholder="index.pregunta"></input>
      <br>
      <span> {{ index.resposta_correcta }}</span>
      <br>
      <span v-for="(resposta, i) in index.respostes_incorrectes" :key="i">
        {{ resposta }}
        <br>
      </span>
      <button @click="eliminarPregunta(index)">Eliminar</button><button @click="acutalizarPregunta(index)">Acutalizar</button>
    </div>
  </main>
</template>

<style scoped>
  .titulo {
  }
</style>
