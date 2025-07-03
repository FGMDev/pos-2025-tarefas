import requests

BASE_URL = "https://jsonplaceholder.typicode.com/users"

class API:
    def __init__(self, BASE_URL):
        self.BASE_URL = BASE_URL
    
    def list(self):
        response = requests.get(self.BASE_URL)
        if response.status_code == 200:
            return response.json()
        else:
            response.raise_for_status()
    
    def create(self):
        response = requests.get(self.BASE_URL)
        if response.status_code == 201:
            return response.json()
        else:
            response.raise_for_status()
    
    def update(self):
        response = requests.get(self.BASE_URL)
        if response.status_code == 200:
            return response.json()
        else:
            response.raise_for_status()
    
    def delete(self):
        response = requests.get(self.BASE_URL)
        if response.status_code == 200:
            return response.json()
        else:
            response.raise_for_status()