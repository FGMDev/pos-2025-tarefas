from users import API
import argparse
import json

api = API(base_url="https://jsonplaceholder.typicode.com/users")

parser = argparse.ArgumentParser(description="CLI para gerenciar usuários (JSONPlaceholder)")

parser.add_argument("action", choices=["list", "create", "read", "update", "delete"], help="Ação a realizar")
parser.add_argument("--id", help="ID do usuário")
parser.add_argument("--data", help="Dados do usuário em JSON (para create/update)")

args = parser.parse_args()

try:
    if args.action == "list":
        result = api.list()
    elif args.action == "create":
        if not args.data:
            raise ValueError("Você deve fornecer os dados com --data")
        data = json.loads(args.data)
        result = api.create(data)
    elif args.action == "read":
        if not args.id:
            raise ValueError("Você deve fornecer o ID com --id")
        result = api.read(args.id)
    elif args.action == "update":
        if not args.id or not args.data:
            raise ValueError("Você deve fornecer o ID com --id e os dados com --data")
        data = json.loads(args.data)
        result = api.update(args.id, data)
    elif args.action == "delete":
        if not args.id:
            raise ValueError("Você deve fornecer o ID com --id")
        result = api.delete(args.id)

    print(json.dumps(result, indent=2, ensure_ascii=False))

except Exception as e:
    print(f"Erro: {e}")