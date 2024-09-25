<script setup>
import { ref, onMounted } from 'vue';



let newObj = ref([]);

onMounted(() => {
  fetch('http://localhost:3000/start').then(res => res.json())
  .then((data) => {
    newObj.value = data.preguntes;
  })
})

// function mezclarRespuestas(pregunta) {
//   const respuestas = [pregunta.resposta_correcta, ...pregunta.respostes_incorrectes];
//   return respuestas.sort(() => Math.random() - 0.5); // Mezcla aleatoria de respuestas
// }

</script>

<template>
  <header>
    <h1>Autoescola</h1>
  </header>
  <br>

  <main>
    <div id="preguntes" v-for="(preguntes, index) in newObj" :key="index">
      <h2>{{ preguntes.pregunta }}</h2>
      <ul>
        <li v-for="(respuesta, i) in mezclarRespuestas(preguntes)" :key="i">
          {{ respuesta }}
        </li>
      </ul>
      <button>Eliminar</button><button>Acutalizar</button>
    </div>
  </main>
</template>

<style scoped>

</style>
