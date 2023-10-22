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
import io
import requests
from colorthief import ColorThief
from urllib.request import urlopen
from flask import render_template, abort, jsonify, request

from main import bp
from config import settings
from db.model import Color
from flask_sqlalchemy_session import current_session as db_session


@bp.route('/movie/<string:wapitch_id>')
@bp.route('/movie/<string:wapitch_id>/<string:country_code>')
def movie_info(wapitch_id, country_code=None):
    response = requests.get(f'{settings.WAPITCH_INTERNAL_BASE_URL}/content/movies/{wapitch_id}?append=providers')
    if response.status_code != 200:
        abort(404)

    response = response.json()
    providers = []
    if country_code and len(response['providers']) > 0:
        for provider in response['providers']:
            if provider['country_code'] == country_code:
                providers.append({'id': provider['provider_id'],
                                  'url': provider['url']})
    if providers:
        providers = enumerate(providers)
    else:
        providers = None

    tmdb_id = response['tmdb_id']
    if response["release_date"] != None and response["release_date"] != "":
        title = f'{response["usa_title"]} ({response["release_date"][:4]}) | Discyo'
    else:
        title = f'{response["usa_title"]} | Discyo'

    response = requests.get(f'{settings.RAPI_BASE_URL}/movies/similar/{wapitch_id}?count=7')
    if response.status_code == 200:
        response = response.json()
        if 'items' not in response:
            similar = None
        else:
            similar = response['items']
    else:
        similar = None

    return render_template('movie.html', title=title, tmdb_id=tmdb_id, wapitch_id=wapitch_id, providers=providers, similar=similar, WAPITCH_BASE_URL=settings.WAPITCH_BASE_URL)


@bp.route('/show/<string:wapitch_id>')
@bp.route('/show/<string:wapitch_id>/<string:country_code>')
def show_info(wapitch_id, country_code=None):
    response = requests.get(f'{settings.WAPITCH_INTERNAL_BASE_URL}/content/shows/{wapitch_id}?append=providers')
    if response.status_code != 200:
        abort(404)

    response = response.json()
    providers = []
    if country_code and len(response['providers']) > 0:
        for provider in response['providers']:
            if provider['country_code'] == country_code:
                providers.append({'id': provider['provider_id'],
                                  'url': provider['url']})
    if providers:
        providers = enumerate(providers)
    else:
        providers = None

    tmdb_id = response['tmdb_id']
    if response["first_air_date"] != None and response["first_air_date"] != "":
        title = f'{response["usa_title"]} ({response["first_air_date"][:4]}) | Discyo'
    else:
        title = f'{response["usa_title"]} | Discyo'

    response = requests.get(f'{settings.RAPI_BASE_URL}/shows/similar/{wapitch_id}?count=7')
    if response.status_code == 200:
        response = response.json()
        if 'items' not in response:
            similar = None
        else:
            similar = response['items']
    else:
        similar = None

    return render_template('show.html', title=title, tmdb_id=tmdb_id, wapitch_id=wapitch_id, providers=providers, similar=similar, WAPITCH_BASE_URL=settings.WAPITCH_BASE_URL)


@bp.route('/bg-color/<string:wapitch_id>')
def get_bg_color(wapitch_id):
    color = db_session.query(Color).filter(Color.uuid == wapitch_id).first()
    if color == None:
        image_path = request.headers.get('image-path')
        fd = urlopen(image_path)
        f = io.BytesIO(fd.read())
        color_thief = ColorThief(f)
        red, green, blue = color_thief.get_color(quality=1)
        color = Color(wapitch_id, red, green, blue)
        db_session.add(color)
        db_session.commit()
    else:
        red = color.red
        green = color.green
        blue = color.blue

    return jsonify({
        'red': red,
        'green': green,
        'blue': blue}), 200
