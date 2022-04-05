from unittest import result
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, render_template, request, redirect, jsonify
import json
import os

password = "admin"
##################################################
# Database Setup
##################################################


# Initiate Flask Application
app = Flask(__name__)


# Routing do define url
@app.route('/')
def startingPage():
    return render_template("index3.html")


# ========================================================
# MAKING API ROUTES TO RETRIEVE THE DATA FROM THE DATABASE
# --------------------------------------------------------


@app.route("/evMap")
def evStationMaps():
    engine = create_engine(os.getenv("DATABASE_URL",
        f'postgresql+psycopg2://postgres:{password}@localhost/Project_3_ev_stations'))

    # reflect an existing database into a new model
    Base = automap_base()
    # reflect the tables
    Base.prepare(engine, reflect=True)

    # Save reference to the table:
    alt_fuel_stations = Base.classes.alt_fuel_stations

    session = Session(engine)

    results = session.query(alt_fuel_stations.longitude,
                            alt_fuel_stations.latitude, alt_fuel_stations.id).all()
    ev_station = []

    session.close()

    for lon, lat, stationID in results:
        stations_dict = {}
        stations_dict["longitude"] = lon
        stations_dict["latitude"] = lat
        stations_dict['stationID'] = stationID
        ev_station.append(stations_dict)

    return jsonify(ev_station)


@app.route("/state-emission/overview")
def statesco2_emission():

    engine = create_engine(os.getenv("DATABASE_URL",
        f'postgresql+psycopg2://postgres:{password}@localhost/Project_3_ev_stations'))
    # reflect an existing database into a new model
    Base = automap_base()
    # reflect the tables
    Base.prepare(engine, reflect=True)

    # Save reference to the table:

    statesco2_emission = Base.classes.statesco2_emission

    session = Session(engine)

    results2 = session.query(statesco2_emission.state,
                             statesco2_emission.percent, statesco2_emission.absolute).all()

    state_overview = []
    session.close()

    for state, percentage, absolute in results2:
        state_dict = {}
        state_dict["state"] = state
        state_dict['percentage'] = percentage
        state_dict['absolute'] = absolute
        state_overview.append(state_dict)

    return jsonify(state_overview)


@app.route("/us-emission")
def usandworldco2():
    engine = create_engine(os.getenv("DATABASE_URL",
        f'postgresql+psycopg2://postgres:{password}@localhost/Project_3_ev_stations'))

    # reflect an existing database into a new model
    Base = automap_base()
    # reflect the tables
    Base.prepare(engine, reflect=True)

    # Save reference to the table:
    usandworldco2 = Base.classes.usandworldco2

    session = Session(engine)

    # this api only get the emission level of the US (filter with US only)
    results3 = session.query(
        usandworldco2.entity, usandworldco2.year, usandworldco2.annualco2emissions).filter(usandworldco2.entity == "United States").all()

    print("results3: ", results3)
    us_emission = []
    session.close()

    for entity, year, emission in results3:
        us_emission_dict = {}
        us_emission_dict["country"] = entity
        us_emission_dict['year'] = year
        us_emission_dict['annual emission'] = emission
        us_emission.append(us_emission_dict)

    return jsonify(us_emission)


if __name__ == '__main__':
    # Threaded option to enable multiple instances for multiple user access support
    app.run(debug=True)
