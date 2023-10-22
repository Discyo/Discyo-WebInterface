"""
Copyright (C) 2023  Petr Buchal, Vladimír Jeřábek, Martin Ivančo

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
"""
import uvicorn
from app import create_app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host='127.0.0.1', port=2000)
