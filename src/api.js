import { derived, writable } from 'svelte/store';

import { getRandomElement } from './util.js';

export const index = writable([]);
export const indexSize = derived(index, (_index) => index.length);

fetch('/index.json')
    .then((response) => {
        console.log('Index fetch response:', response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then((items) => {
        console.log('Index data loaded:', items.length, 'items');
        index.set(items.map(([sailnumber, name, type]) => ({ sailnumber, name, type })));
    })
    .catch((error) => {
        console.error('Failed to load index.json:', error);
    });

export const randomBoat = derived(index, (_index) => {
    if (_index.length === 0) {
        return null;
    }
    return getRandomElement(_index).sailnumber;
});

let cache = {};

export function getBoat(sailnumber) {
    if (sailnumber in cache) {
        return new Promise((resolve) => resolve(cache[sailnumber]));
    } else {
        return fetch(`/data/${sailnumber}.json`).then((response) => {
            cache[sailnumber] = response.json();
            return cache[sailnumber];
        });
    }
}

export function getExtremes() {
    return fetch('/extremes.json').then((response) => response.json());
}
