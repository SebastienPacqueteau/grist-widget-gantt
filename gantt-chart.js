// ====================================
// ==== Configuration pour Grist ======
// ====================================
let diagrammeGantt = null; //Création d'une variable qui représente l'objet chartJS

let colonnesNecessaires = [
	{
		name: 'projet',
    title: "Nom du projet",
    type: 'Any', // optional type of the column, // Int (Integer column), Numeric (Numeric column), Text, Date, DateTime, Bool (Toggle column), Choice, ChoiceList, Ref (Reference column), RefList (Reference List), Attachments.
		optional: false // if column is optional.
	},
	{name: 'agents',title: "Nom du ou des agent(s)",type: 'Any',optional: false},
	{name: 'service',title: "Service",type: 'Any', optional: false},
	{name: 'sousDirection',title: "sous-direction",type: 'Any', optional: false},
	{name: 'contact',title: "Contact du responsable projet",type: 'Any',optional: false},
	{name: 'description',title: "Description du projet",type: 'Text',optional: true},
	{name: 'dateDebut',title: "Date de début de la mission",type: 'Date',optional: false},
	{name: 'dateFin',title: "Date de fin de la mission",type: 'Date',optional: false},
	{name: 'quotite',title: "Quotité du temps sur le projet (en %)",type: 'Any',optional: false},
	{name: 'priorite',title: "Priorite du projet pour le service et la direction",type: 'Any',optional: true},
	{name: 'statut',title: "Statut du projet",type: 'Any',optional: true}
];

//Création d'un objet Projet pour simplifier le passage du tableau d'objet grist au tableau d'objet chartJS
class Projet{
	constructor(nomProjet,dateDebut,dateFin,agents,service,sousDirection, quotite,priorite,statut){
		//this.infoSiret = infoSiret.results[0];
		this.x = [new Date(dateDebut).getTime(),new Date(dateFin).getTime()];
		this.y = nomProjet;
		this.agents = agents;
		this.service = service;
		this.sousDirection = sousDirection;
		this.quotite = quotite;
		this.priorite = priorite;
		this.statut = statut;
	}
}

let nbMaxAgents = 1; // nombre de personnes au maximum par projet

// TODO: on sait maintenant que le connait le nombre max de personnes sur un projet, on peut ajuster la hauteur du projet et ajuster la légende

// ====================================
// ==== Configuration du diagramme ====
// ====================================

//Par défaut on met la date du jour - 2 mois
let dateDebutGantt = new Date();
dateDebutGantt.setMonth(dateDebutGantt.getMonth() - 2);
//Par défaut on met la date du jour + 6 mois
let dateFinGantt = new Date();
dateFinGantt.setMonth(dateFinGantt.getMonth() + 6);


//liste des projets à connecter à un tableau Grist
let listeProjets = [];

//Données pour le graphique
const data = {
  datasets: [{
    labels: 'liste des projets',
    data: listeProjets,
    backgroundColor: [
      'rgba(255,26,104,0.2)',
      'rgba(54,162,235,0.2)',
      'rgba(255,206,86,0.2)',
      'rgba(75,192,192,0.2)',
      'rgba(153,102,255,0.2)',
      'rgba(255,159,64,0.2)',
      'rgba(0,0,0,0.2)'
    ],
    borderColor: [
      'rgba(255,26,104,1)',
      'rgba(54,162,235,1)',
      'rgba(255,206,86,1)',
      'rgba(75,192,192,1)',
      'rgba(153,102,255,1)',
      'rgba(255,159,64,1)',
      'rgba(0,0,0,1)'
    ],
    borderWidth: 1,
    borderSkipped: false,
    borderRadius: 10, //avoir des arrondis
    barPercentage: 0.5 //hauteur des bars
  }]
};

//Objet pour définir la ligne du jour
const LigneJour = {
  id: 'LigneJour',
  //afterDatasetsDraw : utiliser cette fonction pour mettre au premier plan la ligne du jour
  //beforeDatasetsDraw : utiliser cette fonction pour mettre au second plan
  beforeDatasetsDraw(chart, args, pluginOptions){
    const {ctx, data, chartArea: {top, bottom,left, right} , scales: {x,y} } = chart;
		const aujourdhui = new Date();
		if (aujourdhui>dateDebutGantt && aujourdhui<dateFinGantt){
			ctx.save();
			ctx.beginPath();
			ctx.lineWidth = 3;//largeur de la ligne
			ctx.strokeStyle = 'black';//'rgba(53,88,162,1)'; //la couleur de la ligne
			ctx.setLineDash([6,6])
			ctx.moveTo(x.getPixelForValue(aujourdhui),top);
			ctx.lineTo(x.getPixelForValue(aujourdhui),bottom);
			ctx.stroke();
		}
  }
}

//Gauche du graphique
const Agents ={
  id: 'Agents',
  beforeDatasetsDraw(chart, args, pluginOptions){
    const {ctx, data, chartArea: {top, bottom,left, right} , scales: {x,y} } = chart;
    ctx.save();
    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'middle';
    data.datasets[0].data.forEach((projet, i) => {
			if (Array.isArray(projet.agents)){
				const n = projet.agents.length;
				if (n==2){
					ctx.fillText(projet.agents[0], 10,y.getPixelForValue(i)+10);
					ctx.fillText(projet.agents[1], 10,y.getPixelForValue(i)-10);
				}else if(n==3){
					ctx.fillText(projet.agents[0], 10,y.getPixelForValue(i)+12);
					ctx.fillText(projet.agents[1], 10,y.getPixelForValue(i));
					ctx.fillText(projet.agents[2], 10,y.getPixelForValue(i)-12);
				}else{
					ctx.fillText(projet.agents, 10,y.getPixelForValue(i));
				}
			}else{
				ctx.fillText(projet.agents, 10,y.getPixelForValue(i));
			}
    });
    ctx.font = 'bolder 12px sans-serif';
		ctx.fillText('Agents', 10,top-20);
    ctx.restore();
  }
}

//info à droite du graphique
const statut ={
	id: 'Statut',
  beforeDatasetsDraw(chart, args, pluginOptions){
    const {ctx, data, chartArea: {top, bottom,left, right} , scales: {x,y} } = chart;
    ctx.save();
    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'middle';
    data.datasets[0].data.forEach((projet, i) => {
			if(projet.statut){
				ctx.fillText(projet.statut, right + 20,y.getPixelForValue(i));
			}
    });
    ctx.font = 'bolder 12px sans-serif';
		ctx.fillText('statut', right + 20,top-20);
    ctx.restore();
  }
}

//info dans les barres
const textBarre = {
	id: 'Texte Barre',
	beforeDatasetsDraw(chart, args, pluginOptions){
		const {ctx, data, chartArea: {top, bottom,left, right} , scales: {x,y} } = chart;
		let positionX = 0;
		let titreBarre = "";
		ctx.save();
		ctx.font = '12px sans-serif';
		ctx.fillStyle = 'black';
		ctx.textBaseline = 'middle';
		data.datasets[0].data.forEach((projet, i) => {
			titreBarre = "";
			if (projet.service){
				titreBarre = projet.service;
				if (projet.sousDirection){
					titreBarre = titreBarre + " / " + projet.sousDirection;
				}
			}
			if (projet.x[0]>x.min){
				positionX = left + (projet.x[0]-x.min)*x.width/(x.max-x.min);
			}else{
				positionX = left;
			}
			ctx.fillText(titreBarre, positionX + 20,y.getPixelForValue(i));
		});
		ctx.restore();
	}
}

const config = {
  type: 'bar',
  data,
  options: {
    layout:{
      padding: {
				left: 200,
				right: 100
      }
    },
		maintainAspectRatio : false,
    indexAxis: 'y',
    scales: {
      x: {
        position: 'top', // position de l'axe
        type: 'time',
        time: {
          unit: "month"
        },
				min: dateDebutGantt.getTime(),//dateDebutGantt.toLocaleString("en-CA",{dateStyle: "short"}),//date minimal affichée
				max: dateFinGantt.getTime()//dateFinGantt.toLocaleString("en-CA",{dateStyle: "short"})//date maximal affichée
      }
    },
    plugins: {
      legend: {
        display: false //suppression de la légende / série sur le graphique
			},
			tooltip: {
				displayColors: false,
				callbacks: {
					label: function (context) {
						return infoBulle(context);
					}
				}
			}
    }
  },
	plugins: [LigneJour, Agents, statut, textBarre]
};

// ==========================================
// ==== fonctions pour changer les mois =====
// ==========================================

function decalageMois(nbMois){
	dateDebutGantt.setMonth(dateDebutGantt.getMonth() + nbMois);
  dateFinGantt.setMonth(dateFinGantt.getMonth() + nbMois);

	diagrammeGantt.config.options.scales.x.min = dateDebutGantt.getTime();
  diagrammeGantt.config.options.scales.x.max = dateFinGantt.getTime();
  diagrammeGantt.update();
}

function moisMilieu(date){
	ajouteMoisDate (date, dateDebutGantt, -4)
	ajouteMoisDate (date, dateFinGantt, 4)

	diagrammeGantt.config.options.scales.x.min = dateDebutGantt.getTime();
  diagrammeGantt.config.options.scales.x.max = dateFinGantt.getTime();
  diagrammeGantt.update();
}

function ajouteMoisDate (date, objDate, nbMois){
	//date ici est une variale en prevenance d'un champ input de type date
	objDate.setYear(parseInt(date.value.split('-')[0]));
	objDate.setMonth(parseInt(date.value.split('-')[1])-1+nbMois); //car le mois de janvier est le mois 0
	objDate.setDate(parseInt(date.value.split('-')[2]));
}

function telechargementJPEG(){
	document.getElementById('imgGanttLink').href = diagrammeGantt.toBase64Image('image/jpeg', 1);
	alert();
}

function telechargementJPEG() {
  var link = document.createElement("a");
	const aujourdhui = new Date();
	link.download = `${aujourdhui.getFullYear()}-${aujourdhui.getMonth()+1}-${aujourdhui.getDate()}_Diagramme-Gantt.jpg`;
  link.href = diagrammeGantt.toBase64Image('image/jpeg', 1);
  link.click();
}

function telechargementPNG() {
	var link = document.createElement("a");
	const aujourdhui = new Date();
	link.download = `${aujourdhui.getFullYear()}-${aujourdhui.getMonth()+1}-${aujourdhui.getDate()}_Diagramme-Gantt.png`;
  link.href = diagrammeGantt.toBase64Image();
  link.click();
}

function basculerPanneauOption() {
		const sidebar = document.getElementById('sidebar');
		sidebar.classList.toggle('collapsed');
}

function infoBulle(context) {
	let labels = [];
	const data = context.dataset.data[context.dataIndex];

	labels.push(`Date debut : ${new Date(data.x[0]).toLocaleString("fr-FR",{dateStyle: "short"})}`);
	labels.push(`Date fin : ${new Date(data.x[0]).toLocaleString("fr-FR",{dateStyle: "short"})}`);
	if (Array.isArray(data.agents)){
		if (data.agents.length){
			labels.push('liste des agents :');
			data.agents.forEach ((agent, i)=>{
				labels.push(` - ${agent}`);
			});
		}
	}
	if (data.quotite){
		labels.push(`Quotite : ${data.quotite * 100} %`);
	}
	if (data.priorite){
		labels.push(`Priorite : ${data.priorite}`);
	}
	return labels;
}

// ====================================
// ==== fonctions propres à Grist =====
// ====================================

function creerlisteProjets(tableauGrist, tableauProjets, colonnes){
	let projet = null;
	tableauGrist.forEach((ligne, i) => {
		projet = new Projet(ligne[colonnes.projet],
			ligne[colonnes.dateDebut],
			ligne[colonnes.dateFin],
			ligne[colonnes.agents],
			ligne[colonnes.service],
			ligne[colonnes.sousDirection],
			ligne[colonnes.quotite],
			ligne[colonnes.priorite],
			ligne[colonnes.statut]);
		tableauProjets.push(projet);
		if(Array.isArray(projet.agents)){
			if (projet.agents.length > nbMaxAgents){
				nbMaxAgents = projet.agents.length;
			}
		}
	});
}

grist.ready({
	onEditOptions() {
		basculerPanneauOption();
		//telechargeGantt();
  },
  columns: colonnesNecessaires,
	requiredAccess: 'read table',
	allowSelectBy: false
});

async function creationDiagrammeGantt (){
	const tableau = await grist.fetchSelectedTable({format: 'rows'});
	const colonnes = await grist.sectionApi.mappings();
	creerlisteProjets(tableau, listeProjets, colonnes);
	//console.log('creationDiagrammeGantt', tableau, listeProjets, colonnes);
	diagrammeGantt = new Chart(
		document.getElementById('diagrammeGantt'),
		config
	);
	const canvasBoxBarreDefilement = document.querySelector('.canvasBoxBarreDefilement');
	if (listeProjets.length>5) {
		canvasBoxBarreDefilement.style.height = `${listeProjets.length * 50}px`;
	}else{
		canvasBoxBarreDefilement.style.height = '250px';
	}
	console.log('creation Diag gantt : ', diagrammeGantt);
}

creationDiagrammeGantt();
