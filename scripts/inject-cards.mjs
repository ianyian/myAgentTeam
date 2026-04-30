import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('output/index.html', 'utf8');
const marker = '<!-- country-grid: agents 5\u20137 will inject country cards here -->';

const cards = [
  { country:'Germany',     capital:'Berlin',      temp:5.9,  wx:'Clear sky', wind:2.1,  flower:'Cornflower',  img:'country-images/germany.jpg' },
  { country:'Japan',       capital:'Tokyo',       temp:14.9, wx:'Overcast',  wind:3,    flower:'Cherry blossom', img:'country-images/japan.jpg' },
  { country:'South Africa',capital:'Pretoria',    temp:11.6, wx:'Overcast',  wind:11.9, flower:'King Protea', img:'country-images/south-africa.jpg' },
  { country:'Canada',      capital:'Ottawa',      temp:7.6,  wx:'Overcast',  wind:13.9, flower:'Trillium',    img:'country-images/canada.jpg' },
  { country:'Argentina',   capital:'Buenos Aires',temp:14.9, wx:'Clear sky', wind:3,    flower:'Ceibo',       img:'country-images/argentina.jpg' },
];

let insert = '';
for (const c of cards) {
  insert += `<article class="country-card">
  <img src="${c.img}" alt="${c.flower}" class="country-flower">
  <h3>${c.country}</h3>
  <p class="capital">${c.capital}</p>
  <p class="weather">${c.temp}°C — ${c.wx}</p>
  <p class="wind">Wind: ${c.wind} km/h</p>
  <p class="flower-name">National flower: <em>${c.flower}</em></p>
</article>\n`;
}

html = html.replace(marker, insert + marker);
writeFileSync('output/index.html', html);
console.log('Injected', cards.length, 'cards OK');
