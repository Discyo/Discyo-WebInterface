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
from sqlalchemy import Column, Integer, String

from db import Base


class Color(Base):
    __tablename__ = 'color'
    __table_args__ = {'extend_existing': True}
    uuid = Column(String(), primary_key=True, nullable=False)
    red = Column(Integer(), nullable=False)
    green = Column(Integer(), nullable=False)
    blue = Column(Integer(), nullable=False)

    def __init__(self, uuid, red, green, blue):
        self.uuid = uuid
        self.red = red
        self.green = green
        self.blue = blue
