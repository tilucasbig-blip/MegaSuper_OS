#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
seed_supabase.py
Script autônomo em Python para semear dados iniciais no Supabase Database.
Utiliza apenas a biblioteca padrão urllib do Python (sem dependência de SDK ou pip install).
Bypassa RLS (Row Level Security) usando a Service Role Key administrativa.
"""

import json
import urllib.request
import urllib.error
import sys

# DADOS INICIAIS DO BANCO

default_users = [
    {
        "id": "usr_diretor",
        "nome": "Diretor Carlos Silva",
        "email": "diretor@empresa.com",
        "usuario": "diretor",
        "senha": "empresa123",
        "role": "diretor",
        "cargo": "Diretor",
        "ativo": True
    },
    {
        "id": "usr_tecnico",
        "nome": "Técnico Lucas Nunes",
        "email": "tecnico@empresa.com",
        "usuario": "tecnico",
        "senha": "empresa123",
        "role": "ti",
        "cargo": "Técnico de TI",
        "ativo": True
    },
    {
        "id": "usr_usuario",
        "nome": "Usuário João Souza",
        "email": "usuario@empresa.com",
        "usuario": "usuario",
        "senha": "empresa123",
        "role": "usuario",
        "cargo": "Frente de Caixa",
        "ativo": True
    }
]

default_lojas = [
    {"id": "loj_mega_maurilandia", "nome": "Mega Maurilândia"},
    {"id": "loj_mega_turvelandia", "nome": "Mega Turvelandia"},
    {"id": "loj_mega_porteirao", "nome": "Mega Porteirão"},
    {"id": "loj_mega_santa_helena", "nome": "Mega Santa Helena"},
    {"id": "loj_big_maurilandia", "nome": "Big Maurilandia"}
]

default_estoque = [
    {
        "id": "est_ssd",
        "nome_material": "SSD 240GB Kingston",
        "quantidade_atual": 15,
        "estoque_minimo": 5,
        "valor_unitario": 180.00
    },
    {
        "id": "est_ram",
        "nome_material": "Memória RAM DDR4 8GB",
        "quantidade_atual": 8,
        "estoque_minimo": 4,
        "valor_unitario": 220.00
    },
    {
        "id": "est_cabo",
        "nome_material": "Cabo de Rede Cat6 (metros)",
        "quantidade_atual": 120,
        "estoque_minimo": 50,
        "valor_unitario": 2.50
    },
    {
        "id": "est_mouse",
        "nome_material": "Mouse USB Básico",
        "quantidade_atual": 25,
        "estoque_minimo": 8,
        "valor_unitario": 35.00
    },
    {
        "id": "est_teclado",
        "nome_material": "Teclado USB ABNT2",
        "quantidade_atual": 18,
        "estoque_minimo": 6,
        "valor_unitario": 55.00
    },
    {
        "id": "est_roteador",
        "nome_material": "Roteador Wireless TP-Link",
        "quantidade_atual": 3,
        "estoque_minimo": 4,
        "valor_unitario": 199.00
    },
    {
        "id": "est_suporte",
        "nome_material": "Suporte Monitor de Mesa",
        "quantidade_atual": 6,
        "estoque_minimo": 2,
        "valor_unitario": 89.90
    }
]

def enviar_linha_supabase(url_projeto, service_role_key, tabela, dados):
    # Formata a URL REST do Supabase
    url = f"{url_projeto}/rest/v1/{tabela}"
    body = json.dumps(dados).encode('utf-8')
    
    headers = {
        'Content-Type': 'application/json',
        'apikey': service_role_key,
        'Authorization': f"Bearer {service_role_key}",
        'Prefer': 'resolution=merge-duplicates' # Efetua Upsert se a linha já existir (evita chaves duplicadas)
    }
    
    req = urllib.request.Request(
        url,
        data=body,
        headers=headers,
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as err:
        return 500, str(err)

def main():
    print("=" * 60)
    print("   SEMENTEIRA DE DADOS DO SUPABASE - SISTEMA OS")
    print("=" * 60)
    
    # Suporta receber argumentos da linha de comando
    if len(sys.argv) > 2:
        url_projeto = sys.argv[1].strip()
        service_role_key = sys.argv[2].strip()
    else:
        url_projeto = input("Digite a URL do seu Projeto Supabase (ex: https://xxxx.supabase.co): ").strip()
        service_role_key = input("Digite a sua Service Role API Key (chave privada): ").strip()
        
    if not url_projeto or not service_role_key:
        print("[ERRO] A URL do projeto e a chave Service Role sao obrigatorias!")
        return

    # Garante formatação correta da URL (remove barra no final se houver)
    if url_projeto.endswith('/'):
        url_projeto = url_projeto[:-1]

    print(f"\nIniciando insercao no Supabase: {url_projeto}...")
    
    # 1. Semeando Lojas
    print("\nSemeando tabela 'lojas'...")
    for loja in default_lojas:
        status, res = enviar_linha_supabase(url_projeto, service_role_key, "lojas", loja)
        if status in [200, 201, 204]:
            print(f"  [OK] Loja '{loja['id']}' inserida/atualizada.")
        else:
            print(f"  [ERRO] Falha ao salvar loja '{loja['id']}': Status {status} - {res}")

    # 2. Semeando Usuários
    print("\nSemeando tabela 'users'...")
    for user in default_users:
        status, res = enviar_linha_supabase(url_projeto, service_role_key, "users", user)
        if status in [200, 201, 204]:
            print(f"  [OK] Usuario '{user['id']}' inserido/atualizado.")
        else:
            print(f"  [ERRO] Falha ao salvar usuario '{user['id']}': Status {status} - {res}")

    # 3. Semeando Estoque
    print("\nSemeando tabela 'estoque'...")
    for item in default_estoque:
        status, res = enviar_linha_supabase(url_projeto, service_role_key, "estoque", item)
        if status in [200, 201, 204]:
            print(f"  [OK] Item de Estoque '{item['id']}' inserido/atualizado.")
        else:
            print(f"  [ERRO] Falha ao salvar item '{item['id']}': Status {status} - {res}")

    print("\n" + "=" * 60)
    print(" Processo finalizado. Seu banco de dados Supabase (Postgres) esta pronto!")
    print("=" * 60)

if __name__ == "__main__":
    main()
