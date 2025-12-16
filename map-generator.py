from datetime import date, timedelta
import os
from matplotlib import patheffects
import pandas as pd
import matplotlib
matplotlib.use("Agg")

import geopandas as gpd
import matplotlib.pyplot as plt

yesterday = date.today() - timedelta(days=1)

OUTPUT_FOLDER = os.path.join(
    "data",
    str(yesterday.year),
    f"{yesterday.month:02d}",
    f"{yesterday.day:02d}",
)


def generate_tmax_map(gdf):
    fig, ax = plt.subplots(figsize=(10, 10))

    gdf.plot(
        ax=ax,
        edgecolor="black",
        facecolor="#e0e0e0",
        linewidth=0.8,
        cmap="Reds",
        column="Max Temperature (°C)",
        legend=True,
        missing_kwds={"color": "lightgrey", "label": "Sin datos"}
    )


    for idx, row in gdf.iterrows():
        if pd.notna(row["Max Temperature (°C)"]):
            x, y = row["geometry"].centroid.x, row["geometry"].centroid.y
            txt = ax.text(
                x, y,
                f"{row['Max Temperature (°C)']:.1f}°C",
                horizontalalignment="center",
                verticalalignment="center",
                fontsize=8,
                color="black"
            )

    ax.set_title("Temperatura máxima en Mallorca")
    ax.axis("off")

    plt.savefig(f"{OUTPUT_FOLDER}/t_max_mallorca.png", dpi=180, bbox_inches="tight")
    plt.close()

def generate_tmin_map(gdf):
    fig, ax = plt.subplots(figsize=(10, 10))
    gdf.plot(
        ax=ax,
        edgecolor="black",
        facecolor="#e0e0e0",
        linewidth=0.8,
        cmap="Blues",
        column="Min Temperature (°C)",
        legend=True,
        missing_kwds={"color": "lightgrey", "label": "Sin datos"}
    )


    for idx, row in gdf.iterrows():
        if pd.notna(row["Min Temperature (°C)"]):
            x, y = row["geometry"].centroid.x, row["geometry"].centroid.y
            txt = ax.text(
                x, y,
                f"{row['Min Temperature (°C)']:.1f}°C",
                horizontalalignment="center",
                verticalalignment="center",
                fontsize=8,
                color="white"
            )
            txt.set_path_effects([
                patheffects.withStroke(linewidth=1, foreground="black")])

    ax.set_title("Temperatura mínima en Mallorca")
    ax.axis("off")

    plt.savefig(f"{OUTPUT_FOLDER}/t_min_mallorca.png", dpi=180, bbox_inches="tight")
    plt.close()
    
def generate_rain_map(gdf):
    fig, ax = plt.subplots(figsize=(10, 10))
    gdf.plot(
        ax=ax,
        edgecolor="black",
        facecolor="#e0e0e0",
        linewidth=0.8,
        cmap="viridis",
        column="Total Precipitation (l)",
        legend=True,
        missing_kwds={"color": "lightgrey", "label": "Sin datos"}
    )


    for idx, row in gdf.iterrows():
        if pd.notna(row["Total Precipitation (l)"]):
            x, y = row["geometry"].centroid.x, row["geometry"].centroid.y
            txt = ax.text(
                x, y,
                f"{row['Total Precipitation (l)']:.1f} l",
                horizontalalignment="center",
                verticalalignment="center",
                fontsize=8,
                color="white"
            )
            txt.set_path_effects([
                patheffects.withStroke(linewidth=1, foreground="black")])

    ax.set_title("Precipitación total en Mallorca")
    ax.axis("off")

    plt.savefig(f"{OUTPUT_FOLDER}/rain_mallorca.png", dpi=180, bbox_inches="tight")
    plt.close()


def generate_average_humidity_map(gdf):
    fig, ax = plt.subplots(figsize=(10, 10))
    gdf.plot(
        ax=ax,
        edgecolor="black",
        facecolor="#e0e0e0",
        linewidth=0.8,
        cmap="YlGn",
        column="Total Precipitation (l)",
        legend=True,
        missing_kwds={"color": "lightgrey", "label": "Sin datos"}
    )


    for idx, row in gdf.iterrows():
        if pd.notna(row["Avg Humidity (%)"]):
            x, y = row["geometry"].centroid.x, row["geometry"].centroid.y
            txt = ax.text(
                x, y,
                f"{row['Avg Humidity (%)']:.1f}%",
                horizontalalignment="center",
                verticalalignment="center",
                fontsize=8,
                color="white"
            )
            txt.set_path_effects([
                patheffects.withStroke(linewidth=1, foreground="black")])

    ax.set_title("Humedad media en Mallorca")
    ax.axis("off")

    plt.savefig(f"{OUTPUT_FOLDER}/humidity_mallorca.png", dpi=180, bbox_inches="tight")
    plt.close()

def generate_maps():
    gdf = gpd.read_file("mallorca-towns.geojson")
    df = pd.read_csv(f"{OUTPUT_FOLDER}/station-summary.csv")
    gdf = gdf.merge(df, left_on="shapeName", right_on="Station", how="left")


    generate_tmax_map(gdf)
    generate_tmin_map(gdf)
    generate_rain_map(gdf)
    generate_average_humidity_map(gdf)



generate_maps()