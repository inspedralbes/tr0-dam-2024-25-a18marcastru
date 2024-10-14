import os
import json
import matplotlib.pyplot as plt
import numpy as np
from matplotlib import rcParams
from datetime import datetime
import sys

# Configuración para asegurarse de que matplotlib maneje bien los caracteres UTF-8
rcParams['font.family'] = 'sans-serif'
rcParams['font.sans-serif'] = ['DejaVu Sans']
rcParams['axes.unicode_minus'] = False

# Función para leer y procesar el archivo JSON
def read_data_from_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    return data

# Función para generar la gráfica con todas las preguntas
def generate_combined_graph(data, date_str):
    current_dir = os.getcwd()
    graph_dir = os.path.join(current_dir, 'Grafiques')
    if not os.path.exists(graph_dir):
        os.makedirs(graph_dir)

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

    # Crear la gráfica de barras
    x = np.arange(len(preguntas))  # Posición de las barras
    width = 0.35  # Ancho de las barras

    fig, ax = plt.subplots(figsize=(12, 8))
    bars1 = ax.bar(x - width/2, correct_counts, width, label='Correctes', color='green', alpha=0.7)
    bars2 = ax.bar(x + width/2, incorrect_counts, width, label='Incorrectes', color='red', alpha=0.7)

    # Etiquetas y título
    ax.set_xlabel('Preguntes', fontsize=12)
    ax.set_ylabel('Percentatge (%)', fontsize=12)
    ax.set_title('Percentatge de Respostes Correctes i Incorrectes per Pregunta', fontsize=14)
    ax.set_xticks(x)
    ax.set_xticklabels(preguntas, rotation=30, ha='right', fontsize=7)

    # Añadir etiquetas de porcentaje en las barras
    for bar in bars1:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2, yval + 1, f'{int(yval)}%', ha='center', va='bottom')

    for bar in bars2:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2, yval + 1, f'{int(yval)}%', ha='center', va='bottom')

    # Añadir leyenda
    ax.legend()

    # Añadir la fecha en la parte superior izquierda de la gráfica
    ax.text(0.01, 1.05, f'Fecha: {date_str}', ha='left', va='center', transform=ax.transAxes, fontsize=10)

    # Guardar la gráfica usando la fecha pasada como argumento
    graph_path = os.path.join(graph_dir, f'{date_str}.png')
    plt.savefig(graph_path, bbox_inches='tight')
    plt.close()

# Función principal para ejecutar el script
def main():
    # Obtener la fecha pasada como argumento
    if len(sys.argv) < 2:
        print("Error: Has de proporcionar la data com a argument")
        return

    fecha_actual = sys.argv[1]

    json_dir = os.path.join('Jocs', fecha_actual)
    json_file = os.path.join(json_dir, 'Respostes_usuaris.json')

    if not os.path.exists(json_file):
        print(f"Error: No es va trobar l'arxiu {json_file}")
        return

    data = read_data_from_json(json_file)
    
    # Generar la gráfica combinada
    generate_combined_graph(data, fecha_actual)

if __name__ == "__main__":
    main()
