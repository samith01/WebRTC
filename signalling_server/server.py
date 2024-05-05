import asyncio
import websockets

connected_clients = {}

async def handle_message(websocket, path):
    if path not in connected_clients:
        connected_clients[path] = set()
    
    connected_clients[path].add(websocket)
    try:
        async for message in websocket:
            for client_socket in connected_clients[path]:
                if client_socket != websocket:
                    await client_socket.send(message)

    finally:
        connected_clients[path].remove(websocket)

start_server = websockets.serve(handle_message, "localhost", 8080)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
