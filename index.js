const countries = (await (await fetch("https://api.railway-stations.org/countries")).json()).map(country => country.code);

const list = (await Promise.all(countries.map(async country => {
    const countryResponse = await fetch(`https://api.railway-stations.org/photoStationsByCountry/${country}?hasPhoto=false`);
    const { stations } = await countryResponse.json();

    return stations.map(station => {
        return {
            lat: station.lat,
            lon: station.lon,
            photos: station.photos.map(photo => {
                return {
                    author: photo.photographer,
                    date: new Date(photo.createdAt),
                    imageUrl: `https://api.railway-stations.org/photos${photo.path}`,
                    license: licenseToSpdx(photo.license),
                    pageUrl: `https://map.railway-stations.org/station.php?countryCode=${country}&stationId=${station.id}`,
                    thumbUrl: `https://api.railway-stations.org/photos${photo.path}?width=500`,
                    source: "railway-stations.org"
                }
            })
        }
    })
}))).flat()

Deno.writeTextFileSync("list.json", JSON.stringify(list));

function licenseToSpdx(code) {
    if(code === "CC0_10") return "CC0-1.0";
    if(code === "CC_BY_30") return "CC-BY-3.0";
    if(code === "CC_BY_SA_40") return "CC-BY-SA-4.0";
    if(code === "CC_BY_NC_40_INT") return "CC-BY-NC-4.0";
    if(code === "CC_BY_NC_SA_30_DE") return "CC-BY-NC-SA-3.0-DE";
}
