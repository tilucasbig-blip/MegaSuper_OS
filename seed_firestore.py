#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
seed_firestore.py
Script autônomo em Python para semear dados iniciais no Firestore do Firebase.
Utiliza apenas bibliotecas padrão do Python (sem dependência de SDK ou pip install).
Requer apenas que o Firestore esteja temporariamente configurado em 'Test Mode'
(com regras públicas de leitura/escrita habilitadas).
"""

import json
import urllib.request
import urllib.error
import datetime
import sys

# DADOS INICIAIS A SEREM INSERIDOS

default_users = [
    {
        "id": "usr_diretor",
        "fields": {
            "uid": {"stringValue": "usr_diretor"},
            "nome": {"stringValue": "Diretor Carlos Silva"},
            "email": {"stringValue": "diretor@empresa.com"},
            "role": {"stringValue": "diretor"},
            "ativo": {"booleanValue": True},
            "created_at": {"timestampValue": datetime.datetime.utcnow().isoformat() + "Z"}
        }
    },
    {
        "id": "usr_tecnico",
        "fields": {
            "uid": {"stringValue": "usr_tecnico"},
            "nome": {"stringValue": "Técnico Lucas Nunes"},
            "email": {"stringValue": "tecnico@empresa.com"},
            "role": {"stringValue": "ti"},
            "ativo": {"booleanValue": True},
            "created_at": {"timestampValue": datetime.datetime.utcnow().isoformat() + "Z"}
        }
    },
    {
        "id": "usr_usuario",
        "fields": {
            "uid": {"stringValue": "usr_usuario"},
            "nome": {"stringValue": "Usuário João Souza"},
            "email": {"stringValue": "usuario@empresa.com"},
            "role": {"stringValue": "usuario"},
            "ativo": {"booleanValue": True},
            "created_at": {"timestampValue": datetime.datetime.utcnow().isoformat() + "Z"}
        }
    }
]

default_lojas = [
    {"id": "loj_matriz", "fields": {"id": {"stringValue": "loj_matriz"}, "nome": {"stringValue": "Loja Matriz (Sede)"}}},
    {"id": "loj_centro", "fields": {"id": {"stringValue": "loj_centro"}, "nome": {"stringValue": "Loja Centro"}}},
    {"id": "loj_shopping", "fields": {"id": {"stringValue": "loj_shopping"}, "nome": {"stringValue": "Loja Shopping"}}},
    {"id": "loj_norte", "fields": {"id": {"stringValue": "loj_norte"}, "nome": {"stringValue": "Loja Distrito Norte"}}}
]

default_estoque = [
    {
        "id": "est_ssd",
        "fields": {
            "id": {"stringValue": "est_ssd"},
            "nome_material": {"stringValue": "SSD 240GB Kingston"},
            "quantidade_atual": {"integerValue": 15},
            "estoque_minimo": {"integerValue": 5},
            "valor_unitario": {"doubleValue": 180.00}
        }
    },
    {
        "id": "est_ram",
        "fields": {
            "id": {"stringValue": "est_ram"},
            "nome_material": {"stringValue": "Memória RAM DDR4 8GB"},
            "quantidade_atual": {"integerValue": 8},
            "estoque_minimo": {"integerValue": 4},
            "valor_unitario": {"doubleValue": 220.00}
        }
    },
    {
        "id": "est_cabo",
        "fields": {
            "id": {"stringValue": "est_cabo"},
            "nome_material": {"stringValue": "Cabo de Rede Cat6 (metros)"},
            "quantidade_atual": {"integerValue": 120},
            "estoque_minimo": {"integerValue": 50},
            "valor_unitario": {"doubleValue": 2.50}
        }
    },
    {
        "id": "est_mouse",
        "fields": {
            "id": {"stringValue": "est_mouse"},
            "nome_material": {"stringValue": "Mouse USB Básico"},
            "quantidade_atual": {"integerValue": 25},
            "estoque_minimo": {"integerValue": 8},
            "valor_unitario": {"doubleValue": 35.00}
        }
    },
    {
        "id": "est_teclado",
        "fields": {
            "id": {"stringValue": "est_teclado"},
            "nome_material": {"stringValue": "Teclado USB ABNT2"},
            "quantidade_atual": {"integerValue": 18},
            "estoque_minimo": {"integerValue": 6},
            "valor_unitario": {"doubleValue": 55.00}
        }
    },
    {
        "id": "est_roteador",
        "fields": {
            "id": {"stringValue": "est_roteador"},
            "nome_material": {"stringValue": "Roteador Wireless TP-Link"},
            "quantidade_atual": {"integerValue": 3},
            "estoque_minimo": {"integerValue": 4},
            "valor_unitario": {"doubleValue": 199.00}
        }
    },
    {
        "id": "est_suporte",
        "fields": {
            "id": {"stringValue": "est_suporte"},
            "nome_material": {"stringValue": "Suporte Monitor de Mesa"},
            "quantidade_atual": {"integerValue": 6},
            "estoque_minimo": {"integerValue": 2},
            "valor_unitario": {"doubleValue": 89.90}
        }
    }
]

def enviar_documento(project_id, collection, doc_id, fields):
    url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/{collection}?documentId={doc_id}"
    body = json.dumps({"fields": fields}).encode('utf-8')
    
    req = urllib.request.Request(
        url,
        data=body,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        # Se o documento já existe, tenta fazer um PATCH para atualizar
        if e.code == 409: # Conflict
            patch_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/{collection}/{doc_id}"
            req_patch = urllib.request.Request(
                patch_url,
                data=body,
                headers={'Content-Type': 'application/json'},
                method='PATCH'
            )
            try:
                with urllib.request.urlopen(req_patch) as patch_res:
                    return patch_res.status, json.loads(patch_res.read().decode('utf-8'))
            except Exception as patch_err:
                return 500, str(patch_err)
        return e.code, e.read().decode('utf-8')

def main():
    print("=" * 60)
    print("   SEMENTEIRA DE DADOS DO FIREBASE FIRESTORE - SISTEMA OS")
    print("=" * 60)
    
    if len(sys.argv) > 1:
        project_id = sys.argv[1].strip()
    else:
        project_id = input("Digite o ID do seu Projeto Firebase: ").strip()
        
    if not project_id:
        print("[ERRO] O ID do projeto nao pode ser vazio!")
        return

    print(f"\nIniciando insercao no projeto: {project_id}...")
    print("Certifique-se de que a regra de escrita do Firestore esta temporariamente publica ('allow read, write: if true;')")
    
    # 1. Semeando Lojas
    print("\nSemeando Colecao 'lojas'...")
    for loja in default_lojas:
        status, res = enviar_documento(project_id, "lojas", loja["id"], loja["fields"])
        if status in [200, 201]:
            print(f"  [OK] Loja '{loja['id']}' inserida/atualizada.")
        else:
            print(f"  [ERRO] Falha ao salvar loja '{loja['id']}': {res}")

    # 2. Semeando Usuários
    print("\nSemeando Colecao 'users'...")
    for user in default_users:
        status, res = enviar_documento(project_id, "users", user["id"], user["fields"])
        if status in [200, 201]:
            print(f"  [OK] Usuario '{user['id']}' inserido/atualizado.")
        else:
            print(f"  [ERRO] Falha ao salvar usuario '{user['id']}': {res}")

    # 3. Semeando Estoque
    print("\nSemeando Colecao 'estoque'...")
    for item in default_estoque:
        status, res = enviar_documento(project_id, "estoque", item["id"], item["fields"])
        if status in [200, 201]:
            print(f"  [OK] Item de Estoque '{item['id']}' inserido/atualizado.")
        else:
            print(f"  [ERRO] Falha ao salvar item '{item['id']}': {res}")

    print("\n" + "=" * 60)
    print(" Processo finalizado. Seu banco de dados Firestore esta pronto!")
    print(" Lembre-se de colar as regras do arquivo 'firestore.rules' para proteger o banco.")
    print("=" * 60)

if __name__ == "__main__":
    main()
