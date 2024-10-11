import os
import json
import matplotlib.pyplot as plt
import numpy as np

# Función para leer y procesar el archivo JSON
def read_data_from_json(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

# Función para generar la gráfica de barras
def generate_graph(data):
    # Obtener el directorio actual
    current_dir = os.getcwd()  # Obtiene la ruta del directorio actual

    # Iterar sobre las preguntas para extraer los datos
    for i, pregunta in enumerate(data['preguntes']):
        labels = []
        counts = []

        for resposta in pregunta['resposta_usuaris']:
            labels.append(resposta['resposta'])
            counts.append(resposta['contador'])

        # Crear gráfica de barras para cada pregunta
        plt.figure(figsize=(8, 6))
        y_pos = np.arange(len(labels))

        plt.barh(y_pos, counts, align='center', alpha=0.7)
        plt.yticks(y_pos, labels)
        plt.xlabel('Número de respuestas')
        plt.title(f"Pregunta {i+1}: {pregunta['pregunta']}")

        # Guardar la gráfica en el directorio actual
        plt.savefig(f'{current_dir}/Grafiques/graph_{i+1}.png')  # Guardar en la carpeta actual
        plt.close()

# Función principal para ejecutar el script
def main():
    # Leer datos del archivo JSON
    data = read_data_from_json('preguntes.json')  # Asumiendo que el archivo se llama data.json
    
    # Generar gráficas
    generate_graph(data)

# Ejecutar la función principal
if __name__ == "__main__":
    main()
