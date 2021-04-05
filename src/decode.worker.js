import { VectorTile } from '@mapbox/vector-tile';
import Pbf from 'pbf';
import * as turf from '@turf/turf';

const token = 'tk.eyJ1Ijoid2luZHloIiwiZXhwIjoxNjE3NjEwMjA0LCJpYXQiOjE2MTc2MDY2MDMsInNjb3BlcyI6WyJlc3NlbnRpYWxzIiwic2NvcGVzOmxpc3QiLCJtYXA6cmVhZCIsIm1hcDp3cml0ZSIsInVzZXI6cmVhZCIsInVzZXI6d3JpdGUiLCJ1cGxvYWRzOnJlYWQiLCJ1cGxvYWRzOmxpc3QiLCJ1cGxvYWRzOndyaXRlIiwic3R5bGVzOnRpbGVzIiwic3R5bGVzOnJlYWQiLCJmb250czpsaXN0IiwiZm9udHM6cmVhZCIsImZvbnRzOndyaXRlIiwic3R5bGVzOndyaXRlIiwic3R5bGVzOmxpc3QiLCJzdHlsZXM6ZG93bmxvYWQiLCJ0b2tlbnM6cmVhZCIsInRva2Vuczp3cml0ZSIsImRhdGFzZXRzOmxpc3QiLCJkYXRhc2V0czpyZWFkIiwiZGF0YXNldHM6d3JpdGUiLCJ0aWxlc2V0czpsaXN0IiwidGlsZXNldHM6cmVhZCIsInRpbGVzZXRzOndyaXRlIiwiZG93bmxvYWRzOnJlYWQiLCJ2aXNpb246cmVhZCIsInZpc2lvbjpkb3dubG9hZCIsIm5hdmlnYXRpb246ZG93bmxvYWQiLCJvZmZsaW5lOnJlYWQiLCJvZmZsaW5lOndyaXRlIiwic3R5bGVzOmRyYWZ0IiwiZm9udHM6bWV0YWRhdGEiLCJzcHJpdGUtaW1hZ2VzOnJlYWQiLCJkYXRhc2V0czpzdHVkaW8iLCJjdXN0b21lcnM6d3JpdGUiLCJjcmVkZW50aWFsczpyZWFkIiwiY3JlZGVudGlhbHM6d3JpdGUiLCJhbmFseXRpY3M6cmVhZCJdLCJjbGllbnQiOiJtYXBib3guY29tIiwibGwiOjE2MTc2MDE1ODUwMDAsIml1IjpudWxsLCJlbWFpbCI6IjI1MDMxNDQ1NTNAcXEuY29tIn0.23jqnMQv6xLmp0pz6U85uA';

function getTileBuffer (x, y, z) {
  return new Promise((resolve, reject) => {
    const url = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/${z}/${x}/${y}.vector.pbf?sku=101VpaBPyToWp&access_token=${token}`;
    fetch(url).then(res => res.arrayBuffer().then(arrayBuffer => {
      resolve(arrayBuffer);
    }).catch(error => {
      reject(error);
    }));
  });
}

function decode (arrayBuffer) {
  const tile = new VectorTile(new Pbf(arrayBuffer));

  const features = [];

  for (const layerName in tile.layers) {
    for (let i = 0; i < tile.layers[layerName].length; i++) {
      features.push(tile.layers[layerName].feature(i).toGeoJSON());
    }
  }

  const featureCollection = turf.featureCollection(features);

  return featureCollection;
}

async function parseTile (x, y, z) {
  const ab = await getTileBuffer(x, y, z);
  // console.time('decode');
  const json = decode(ab);
  // console.timeEnd('decode');
  return json;
}

async function onMessage (e) {
  const { action, payload, timestamp } = e.data;
  const json = await parseTile(payload.x, payload.y, payload.z);

  self.postMessage({
    action,
    payload: {
      data: json
    },
    timestamp
  });
}

self.addEventListener('message', onMessage);
