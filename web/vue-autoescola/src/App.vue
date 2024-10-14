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
const messageUpdate = ref('')

const imageUrls = ref([]);

async function fetchQuestions() {
  try {
    const res = await fetch('http://localhost:20999');
    const data =  await res.json();
    newObj.value = data.preguntes;
  } catch (err) {
    console.log("Error", err)
  }
}

function options(valor, index) {
  preg.value = valor;

  pregunta.value = ""
  resposta_correcta.value = ""
  inc1.value = ""
  inc2.value = ""
  inc3.value = ""

  if(valor === 'edit') {
    preguntaOriginal.value = index.pregunta
    pregunta.value = index.pregunta
    url.value = index.imatge
    resposta_correcta.value = index.resposta_correcta
    inc1.value = index.respostes_incorrectes[0]
    inc2.value = index.respostes_incorrectes[1]
    inc3.value = index.respostes_incorrectes[2]
  }

  if(valor === 'esta') fetchGraphic()
}

async function fetchDeleteQuestion(pregunta) {
  try {
    const res = await fetch('http://localhost:20999/eliminar', {
      method: 'DELETE',
      headers: {
        'content-Type': 'application/json'
      },
      body: JSON.stringify({pregunta: pregunta.pregunta})
    });
    const data = await res.json();
    console.log(data.message);
    fetchQuestions();
  } catch (err) {
    console.log("Error", err);
  }
}

async function fetchAdd() {
  const newData = [inc1.value, inc2.value, inc3.value];

  const newQuestion = {
    pregunta: pregunta.value,
    resposta_correcta: resposta_correcta.value,
    respostes_incorrectes: newData,
    imatge: url.value
  }

  const res = await fetch('http://localhost:20999/afegir', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newQuestion)
  })
  const data = await res.json();
  console.log(data.message);
  fetchQuestions();
}

async function fetchUpdateQuestion() {
  const newData = [inc1.value, inc2.value, inc3.value];

  const updateQuestion = {
    pregunta_original: preguntaOriginal.value,
    pregunta: pregunta.value,
    resposta_correcta: resposta_correcta.value,
    respostes_incorrectes: newData,
    imatge: url.value
  }

  const res = await fetch(`http://localhost:20999/actualitzar`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateQuestion)
  })
  const data = await res.json();
  console.log(data.message);
  messageUpdate.value = "missatge";
  options('edit',updateQuestion);
  fetchQuestions();
}

async function fetchGraphic() {
  try {
    const res = await fetch('http://localhost:20999/grafiques');
    if (res.ok) {
      const data = await res.json();
      imageUrls.value = data.images; // Almacena las URLs de las imágenes
    } else {
      console.error('Error al obtener los gráficos');
    }
  } catch (err) {
    console.error('Error de red:', err);
  }
}

onMounted(() => {
  fetchQuestions();
})
</script>

<template>
  <header>
    <h1>Menu de preguntes</h1>
  </header>
  <br>
  <div>
    <button @click="options('afegir')">Nova pregunta</button>
    <button @click="options('llista')">Llista de preguntes</button>
    <button @click="options('esta')">Estadistiques</button>
  </div>
  <br>
  <div id="preguntes" v-for="index in newObj" :key="index" v-if="preg === 'llista'">
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
      <button @click="fetchDeleteQuestion(index)">Eliminar</button>
      <button @click="options('edit', index)">Editar</button>
    </div>
    <br><br>
  </div>
  <div id="novesPreguntes" v-if="preg === 'afegir'">
    <h1>Nova pregunta</h1>
    <input v-model="pregunta" placeholder="Pregunta">
    <br>
    <input v-model="url" placeholder="URL">
    <br>
    <input v-model="resposta_correcta" placeholder="Resposta correcta">
    <br>
    <input v-model="inc1" placeholder="Resposta incorrecta">
    <br>
    <input v-model="inc2" placeholder="Resposta incorrecta">
    <br>
    <input v-model="inc3" placeholder="Resposta incorrecta">
    <br>
    <button @click="fetchAdd()">Afegir</button>
  </div>
  <div v-if="preg === 'edit'">
    <br>
    <h1>Editar</h1>
    <p v-if="messageUpdate === 'missatge'" id="messageUpdate">Actualitzat</p>
    <p>Pregunta: </p>
    <textarea v-model="pregunta" rows="2" cols="50" :placeholder="pregunta"></textarea>
    <br>
    <p>URL:</p>
    <input v-model="url" :placeholder="url">
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
    <button @click="fetchUpdateQuestion()">Actualizar</button>
  </div>
  <div v-if="preg === 'esta'">
    <h1>Gráficos</h1>
    <div v-for="(url, index) in imageUrls" :key="index" id="grafiques">
      <img :src="url" :alt="'Grafico' + index" />
    </div>
  </div>
</template>

<style scoped>
  body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f9;
    margin: 0;
    padding: 20px;
  }

  header {
    text-align: center;
    background-color: #4caf50;
    color: white;
    padding: 10px;
  }

  h1 {
    margin: 0;
  }

  button {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 10px 20px;
    margin: 5px;
    cursor: pointer;
    border-radius: 5px;
    font-size: 16px;
  }

  button:hover {
    background-color: #45a049;
  }

  div {
    margin-top: 20px;
    text-align: center;
  }

  input {
    padding: 10px;
    width: 80%;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }

  textarea {
    padding: 10px;
    width: 80%;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  ul li {
    margin: 5px 0;
    font-size: 16px;
  }

  img {
    max-width: 100%;
    height: auto;
    margin: 10px 0;
  }

  #preguntes img {
    width: 300px;
  }

  #novesPreguntes,
  #grafiques {
    text-align: left;
    margin: 20px auto;
    max-width: 600px;
  }

  .botones {
    display: flex;
    justify-content: center;
  }

  .botones button {
    margin: 5px;
  }

  #grafiques img {
    margin: 10px 0;
  }

  #messageUpdate {
    color: green;
  }
</style>
