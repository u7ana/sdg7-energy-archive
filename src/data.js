export const PAL={
  cobalt:{bg:'#1F3FB0',tx:'#F1E7D0',pn:'#F1E7D0',a:'#1F3FB0',b:'#D9432A',c:'#141414'},
  cream:{bg:'#E6DBC0',tx:'#141414',pn:'#1F3FB0',a:'#F1E7D0',b:'#D9432A',c:'#141414'},
  verm:{bg:'#D9432A',tx:'#141414',pn:'#F1E7D0',a:'#141414',b:'#D9432A',c:'#1F3FB0'},
  ink:{bg:'#17171A',tx:'#F1E7D0',pn:'#1F3FB0',a:'#F1E7D0',b:'#D9432A',c:'#141414'}
};
export const FILMS=[
 {id:'feron',pal:'verm',title:'Off-Grid Solar',lines:['OFF-GRID','SOLAR'],spine:'OFF-GRID SOLAR',au:'FERON',auFull:'Feron, S.',topic:'Rural access',year:2016,words:818,journal:'Sustainability 8(12)',doi:'10.3390/su8121326',
  syn:'Solar home systems reach villages the grid ignores, yet many stop working within a few years. Institutions, fair pricing, training and battery recycling decide whether the light stays on.',
  stats:[['1.2 B','people without electricity'],['45%','Guatemalan systems not working'],['65%','Laotian systems not working']]},
 {id:'yaici',pal:'cobalt',title:'Smart Buildings',lines:['SMART','BUILDINGS'],spine:'SMART BUILDINGS',au:'YAÏCI',auFull:'Yaïci et al.',topic:'IoT sensing',year:2021,words:756,journal:'Sensors 21(6)',doi:'10.3390/s21062152',
  syn:'Sensors, wireless networks and automatic control let a building measure itself and cut waste. A single upgrade saves 5–15%, and autonomous setups reach up to 50%.',
  stats:[['5–15%','saved by one upgrade'],['45%','lighting savings reported'],['€80','per sensor, EnerMon']]},
 {id:'salah',pal:'cream',title:'Egypt’s Energy Future',lines:['EGYPT','ENERGY','FUTURE'],spine:'EGYPT ENERGY',au:'SALAH',auFull:'Salah et al.',topic:'Egypt',year:2022,words:980,journal:'Cleaner Eng. & Technology 8',doi:'10.1016/j.clet.2022.100497',
  syn:'Egypt receives up to 3,200 kWh/m² of sunshine a year and aims for 42% renewable electricity by 2035. Policy, finance and local manufacturing are the gaps to close.',
  stats:[['42%','renewables target, 2035'],['1.8 GW','Benban solar park, planned'],['3,200','kWh/m² sun, best sites']]},
 {id:'elshamy',pal:'ink',title:'Rooftop Egypt',lines:['ROOFTOP','EGYPT'],spine:'ROOFTOP EGYPT',au:'ELSHAMY',auFull:'Elshamy et al.',topic:'Egypt',year:2022,words:800,journal:'Energies 15(23)',doi:'10.3390/en15238988',
  syn:'Solar-thermal cooling and small rooftop wind turbines could join rooftop PV on Egyptian homes. Voluntary building codes remain the main barrier.',
  stats:[['61–66%','of building power goes to cooling'],['100 m²','of collectors, about 35 kW cooling'],['6.2%','yearly growth in electricity use']]},
 {id:'hossain',pal:'cobalt',title:'Smart Energy Control',lines:['SMART','ENERGY','CONTROL'],spine:'ENERGY CONTROL',au:'HOSSAIN',auFull:'Hossain et al.',topic:'Saving',year:2023,words:769,journal:'Energies 16(4)',doi:'10.3390/en16041609',
  syn:'Buildings use about 40% of the world’s energy. Forecasting, optimisation and automatic control, plus on-site solar, remove the waste that habits alone cannot.',
  stats:[['40%','of global energy, buildings'],['26%','HVAC saving, smart thermostat'],['50%+','cost cut, deep reinforcement learning']]},
 {id:'cavalcanti',pal:'cream',title:'IoT Energy Manager',lines:['IOT','ENERGY','MANAGER'],spine:'IOT ENERGY',au:'CAVALCANTI',auFull:'Cavalcanti & Pimenta',topic:'IoT sensing',year:2023,words:698,journal:'Energies 16(15)',doi:'10.3390/en16155753',
  syn:'A review of 47 studies shows homes and universities lead IoT energy research, with lighting and cooling the main targets. Africa contributes only three studies.',
  stats:[['47','studies reviewed'],['44.7%','focus on homes'],['3','studies from Africa']]},
 {id:'nglup',pal:'verm',title:'Global South Power',lines:['GLOBAL','SOUTH','POWER'],spine:'GLOBAL SOUTH',au:'NG KAY LUP',auFull:'Ng Kay Lup et al.',topic:'Global South',year:2023,words:674,journal:'Environ. Sci.: Advances 2(4)',doi:'10.1039/D2VA00247G',
  syn:'SDG 7 is within reach if renewables, microgrids, efficiency, digital optimisation and Power-to-X are deployed together, with strong policy and finance behind them.',
  stats:[['600 M','Africans without electricity'],['1.2%','energy-intensity gain, 2018'],['47,628 MW','Nepal’s solar potential']]},
 {id:'aly',pal:'ink',title:'Built for Heat',lines:['BUILT','FOR','HEAT'],spine:'BUILT FOR HEAT',au:'ALY',auFull:'Aly & Abdelaziz',topic:'Egypt',year:2024,words:759,journal:'Sustainability 16(12)',doi:'10.3390/su16124980',
  syn:'Design-stage measures cut building energy by tens of percent. Egypt’s green rating system still lacks a prescriptive energy path backed by simulation.',
  stats:[['0.38 °C','warming per decade, 2000–20'],['22%','local studies with cost analysis'],['91.2%','of Egypt’s buildings are homes']]},
 {id:'jorgensen',pal:'cobalt',title:'Zero-Emission Buildings',lines:['ZERO','EMISSION','BUILDINGS'],spine:'ZERO EMISSION',au:'JØRGENSEN',auFull:'Jørgensen & Ma',topic:'Saving',year:2025,words:909,journal:'Applied Sciences 15(21)',doi:'10.3390/app152111660',
  syn:'Most technology for net-zero buildings already exists. Cut demand first with passive design, then electrify with heat pumps and add rooftop solar.',
  stats:[['34%','of energy CO₂, buildings'],['1%','of buildings renovated yearly'],['3–4×','heat per unit of electricity']]},
 {id:'raslan',pal:'cream',title:'East–West Solar Roofs',lines:['EAST-WEST','SOLAR','ROOFS'],spine:'EAST-WEST PV',au:'RASLAN',auFull:'Raslan et al.',topic:'Solar',year:2025,words:800,journal:'Buildings 15(13)',doi:'10.3390/buildings15132326',
  syn:'On Cairo’s Sakan Masr housing blocks, east–west PV out-produces south-facing by over 14% and fits about 50% more panels per roof.',
  stats:[['+14%','output vs south-facing'],['168 t','CO₂ avoided per year'],['50%','electricity cost cut, with AC']]}
];
FILMS.forEach(function(f){f.P=PAL[f.pal];f.romaji=f.au+' / '+f.topic.toUpperCase();});
export const N=FILMS.length,TOT=N*3,HALF=TOT/2,YMIN=2015,YMAX=2026;

