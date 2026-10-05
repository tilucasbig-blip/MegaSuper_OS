#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
create_auth_users.py
Cria os usuários correspondentes no Supabase Auth e vincula no public.users.
Usa a Service Role Key administrativa.
"""

import json
import urllib.request
import urllib.error
import sys

# CONFIGURAÇÕES DOS USUÁRIOS DE TESTE
MOCK_USERS = [
    {
        "email": "diretor@empresa.com",
        "nome": "Diretor Carlos Silva",
        "usuario": "diretor",
        "senha": "empresa123",
        "role": "diretor",
        "cargo": "Diretor"
    },
    {
        "email": "tecnico@empresa.com",
        "nome": "Técnico Lucas Nunes",
        "usuario": "tecnico",
        "senha": "empresa123",
        "role": "ti",
        "cargo": "Técnico de TI"
    },
    {
        "email": "usuario@empresa.com",
        "nome": "Usuário João Souza",
        "usuario": "usuario",
        "senha": "empresa123",
        "role": "usuario",
        "cargo": "Frente de Caixa"
    }
]

DEFAULT_PASSWORD = "empresa123"

def make_request(url, headers, data=None, method='GET'):
    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode('utf-8'))
        except Exception:
            return e.code, {"message": str(e)}
    except Exception as err:
        return 500, {"message": str(err)}

def main():
    print("=" * 60)
    print("   CRIAÇÃO DE USUÁRIOS DE AUTH NO SUPABASE - SISTEMA OS")
    print("=" * 60)
    
    if len(sys.argv) > 2:
        url_projeto = sys.argv[1].strip()
        service_role_key = sys.argv[2].strip()
    else:
        url_projeto = input("Digite a URL do seu Projeto Supabase: ").strip()
        service_role_key = input("Digite a sua Service Role API Key: ").strip()
        
    if not url_projeto or not service_role_key:
        print("[ERRO] A URL do projeto e a Service Role Key sao obrigatorias!")
        return

    if url_projeto.endswith('/'):
        url_projeto = url_projeto[:-1]

    headers = {
        'Content-Type': 'application/json',
        'apikey': service_role_key,
        'Authorization': f"Bearer {service_role_key}"
    }

    # 1. Obter a lista de usuários existentes no Auth
    auth_list_url = f"{url_projeto}/auth/v1/admin/users"
    print("\nBuscando usuarios de Auth existentes...")
    status, res = make_request(auth_list_url, headers, method='GET')
    
    existing_users = {}
    if status == 200:
        # Resposta é {"users": [...]}
        for u in res.get("users", []):
            existing_users[u["email"]] = u["id"]
        print(f"  [OK] Encontrados {len(existing_users)} usuarios cadastrados no Auth.")
    else:
        print(f"  [ERRO] Falha ao listar usuarios do Auth: Status {status} - {res}")
        return

    # 2. Criar ou Obter os UUIDs dos usuários simulados
    user_mapping = [] # lista de dicionarios com id, nome, email, role

    for mock in MOCK_USERS:
        email = mock["email"]
        nome = mock["nome"]
        role = mock["role"]
        usuario = mock["usuario"]
        cargo = mock["cargo"]
        
        if email in existing_users:
            uuid = existing_users[email]
            print(f"  [INFO] Usuario '{email}' ja existe no Auth. UUID: {uuid}")
            user_mapping.append({"id": uuid, "nome": nome, "email": email, "role": role, "usuario": usuario, "cargo": cargo})
        else:
            print(f"  [CRIANDO] Criando usuario '{email}' no Auth...")
            create_payload = {
                "email": email,
                "password": DEFAULT_PASSWORD,
                "email_confirm": True
            }
            c_status, c_res = make_request(auth_list_url, headers, data=create_payload, method='POST')
            if c_status in [200, 201]:
                uuid = c_res.get("id")
                print(f"  [OK] Criado com sucesso! UUID: {uuid}")
                user_mapping.append({"id": uuid, "nome": nome, "email": email, "role": role, "usuario": usuario, "cargo": cargo})
            else:
                print(f"  [ERRO] Falha ao criar usuario '{email}': Status {c_status} - {c_res}")

    # 3. Limpar a tabela public.users de chaves antigas de texto
    print("\nLimpando tabela public.users antiga...")
    clear_url = f"{url_projeto}/rest/v1/users?email=in.(diretor@empresa.com,tecnico@empresa.com,usuario@empresa.com)"
    req_clear = urllib.request.Request(
        clear_url,
        headers=headers,
        method='DELETE'
    )
    try:
        with urllib.request.urlopen(req_clear) as _:
            print("  [OK] Tabela public.users limpa.")
    except Exception as e:
        print(f"  [ERRO] Falha ao limpar tabela users: {e}")

    # 4. Inserir os novos perfis com UUID na tabela public.users
    print("\nInserindo perfis atualizados na tabela public.users...")
    for user in user_mapping:
        user_url = f"{url_projeto}/rest/v1/users"
        status_insert, res_insert = make_request(user_url, headers, data=user, method='POST')
        if status_insert in [200, 201, 204]:
            print(f"  [OK] Perfil '{user['nome']}' cadastrado com UUID '{user['id']}'.")
        else:
            print(f"  [ERRO] Falha ao cadastrar perfil '{user['nome']}': Status {status_insert} - {res_insert}")

    print("\n" + "=" * 60)
    print(" Processo finalizado com sucesso!")
    print(" Os logins podem ser feitos com a senha padrao: 'empresa123'")
    print("=" * 60)

if __name__ == "__main__":
    main()
