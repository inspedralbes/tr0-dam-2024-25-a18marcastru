import os
import json
import matplotlib.pyplot as plt
import numpy as np
from matplotlib import rcParams
from datetime import datetime

# Configuración para asegurarse de que matplotlib maneje bien los caracteres UTF-8
rcParams['font.family'] = 'sans-serif'  # Fuente genérica
rcParams['font.sans-serif'] = ['DejaVu Sans']  # Fuente con buen soporte UTF-8
rcParams['axes.unicode_minus'] = False  # Asegura que los signos negativos se muestren bien

# Función para leer y procesar el archivo JSON
def read_data_from_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:  # Leer el archivo en codificación UTF-8
        data = json.load(file)
    return data

# Función para generar la gráfica con todas las preguntas
def generate_combined_graph(data, date_str):
    # Obtener el directorio actual
    current_dir = os.getcwd()

    # Crear el directorio "Grafiques" si no existe
    graph_dir = os.path.join(current_dir, 'Grafiques')
    if not os.path.exists(graph_dir):
        os.makedirs(graph_dir)  # Crear la carpeta si no existe

    # Preparar datos para la gráfica
    preguntas = [pregunta['pregunta'] for pregunta in data['preguntes']]
    correct_counts = []
    incorrect_counts = []

    # Calcular las respuestas correctas e incorrectas
    for pregunta in data['preguntes']:
        total_respuestas = sum(resposta['contador'] for resposta in pregunta['resposta_usuaris'])
        respuestas_correctas = sum(resposta['contador'] for resposta in pregunta['resposta_usuaris']
                                    if resposta['resposta'] == pregunta['resposta_correcta'])

        if total_respuestas == 0:
            correct_counts.append(0)
            incorrect_counts.append(0)
        else:
            correct_counts.append((respuestas_correctas / total_respuestas) * 100)
            incorrect_counts.append(100 - correct_counts[-1])

    # Crear gráfica de barras
    x = np.arange(len(preguntas))  # La posición de cada pregunta
    width = 0.35  # Ancho de las barras

    fig, ax = plt.subplots(figsize=(12, 8))
    bars1 = ax.bar(x - width/2, correct_counts, width, label='Correctas', color='green', alpha=0.7)
    bars2 = ax.bar(x + width/2, incorrect_counts, width, label='Incorrectas', color='red', alpha=0.7)

    # Etiquetas y título
    ax.set_xlabel('Preguntes', fontsize=12)
    ax.set_ylabel('Porcentaje (%)', fontsize=12)
    ax.set_title('Porcentaje de Respuestas Correctas e Incorrectas por Pregunta', fontsize=14)
    ax.set_xticks(x)
    ax.set_xticklabels(preguntas, rotation=30, ha='right', fontsize=8)

    # Añadir etiquetas de porcentaje en las barras
    for bar in bars1:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2, yval + 1, f'{int(yval)}%', ha='center', va='bottom')

    for bar in bars2:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2, yval + 1, f'{int(yval)}%', ha='center', va='bottom')

    # Añadir leyenda
    ax.legend()

    # Guardar la gráfica en la carpeta Grafiques con el nombre dia-mes-año.png
    graph_path = os.path.join(graph_dir, f'{date_str}.png')
    plt.savefig(graph_path, bbox_inches='tight')  # Ajustar los bordes
    plt.close()

# Función principal para ejecutar el script
def main():
    # Obtener la fecha actual en formato día-mes-año
    fecha_actual = datetime.now().strftime('%d-%m-%Y')

    # Construir la ruta hacia el archivo JSON en la carpeta "Jocs" y la fecha actual
    json_dir = os.path.join('Jocs', fecha_actual)
    json_file = os.path.join(json_dir, 'Respostes_usuaris.json')

    # Verificar si el archivo existe antes de continuar
    if not os.path.exists(json_file):
        print(f"Error: No se encontró el archivo {json_file}")
        return
    
    # Leer datos del archivo JSON
    data = read_data_from_json(json_file)
    
    # Generar la gráfica combinada
    generate_combined_graph(data, fecha_actual)

# Ejecutar la función principal
if __name__ == "__main__":
    main()
