import os
import json
import matplotlib.pyplot as plt
import numpy as np
from matplotlib import rcParams
import sys

rcParams['font.family'] = 'sans-serif'
rcParams['font.sans-serif'] = ['DejaVu Sans']
rcParams['axes.unicode_minus'] = False

def read_data_from_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    return data

def generate_combined_graph(data, date_str):
    current_dir = os.getcwd()
    graph_dir = os.path.join(current_dir, 'Grafiques')
    if not os.path.exists(graph_dir):
        os.makedirs(graph_dir)

    questions = np.array([question['pregunta'] for question in data['preguntes']])
    correct_counts = np.zeros(len(questions))
    total_counts = np.zeros(len(questions))

    for i, question in enumerate(data['preguntes']):
        total_answers = sum(answer['contador'] for answer in question['resposta_usuaris'])
        correct_answers = sum(answer['contador'] for answer in question['resposta_usuaris']
                              if answer['resposta'] == question['resposta_correcta'])

        total_counts[i] = total_answers
        correct_counts[i] = correct_answers

    percentages = np.where(total_counts > 0, (correct_counts / total_counts) * 100, 0)

    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.barh(questions, percentages, color='royalblue', alpha=0.8)

    ax.set_xlabel('Percentatge (%)', fontsize=12)
    ax.set_ylabel('Preguntes', fontsize=12)
    ax.set_title('Percentatge de Respostes Correctes per Pregunta', fontsize=14)
    ax.set_xlim(0, 100)

    for bar in bars:
        ax.text(bar.get_width() + 1, bar.get_y() + bar.get_height() / 2, f'{int(bar.get_width())}%', 
                va='center', ha='left', fontsize=10, color='black')

    ax.text(0, 1.05, f'Fecha: {date_str}', ha='left', va='bottom', transform=ax.transAxes, fontsize=10)

    graph_path = os.path.join(graph_dir, f'{date_str}.png')
    plt.tight_layout()
    plt.savefig(graph_path, bbox_inches='tight')
    plt.close()

def main():
    if len(sys.argv) < 2:
        print("Error: Has de proporcionar la data com a argument")
        return

    current_date = sys.argv[1]
    json_dir = os.path.join('Jocs', current_date)
    json_file = os.path.join(json_dir, 'Respostes_usuaris.json')

    if not os.path.exists(json_file):
        print(f"Error: No es va trobar l'arxiu {json_file}")
        return

    data = read_data_from_json(json_file)
    
    generate_combined_graph(data, current_date)

if __name__ == "__main__":
    main()
