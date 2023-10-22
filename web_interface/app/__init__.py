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
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from flask import Flask
from flask_jsglue import JSGlue
from flask_sqlalchemy_session import flask_scoped_session


def create_app():
    app = Flask(__name__)

    db_session = init_db(app)

    jsglue = JSGlue()
    jsglue.init_app(app)

    from main import bp as main_bp
    app.register_blueprint(main_bp)

    return app


def init_db(app):
    from db import Base
    engine = create_engine(url='sqlite:///./db.sqlite', convert_unicode=True, connect_args={})
    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print("Cannot create DB, because: ", str(e), file=sys.stderr)

    db_session = flask_scoped_session(session_factory, app)
    Base.query = db_session.query_property()
    return db_session


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='127.0.0.1', port=2000)
