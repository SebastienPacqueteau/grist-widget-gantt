// ====================================
// ==== Configuration pour Grist ======
// ====================================
let diagrammeGantt = null; //Création d'une variable qui représente l'objet chartJS

let colonnesNecessaires = [
	{
    name: 'Projet',
    title: "Nom du projet",
    type: 'Any', // optional type of the column, // Int (Integer column), Numeric (Numeric column), Text, Date, DateTime, Bool (Toggle column), Choice, ChoiceList, Ref (Reference column), RefList (Reference List), Attachments.
		optional: false // if column is optional.
	},
	{name: 'NbAgents',title: "Nombre d'Agents sur le projet",type: 'Int',optional: true},
	{name: 'Agents',title: "Nom du ou des agent(s)",type: 'Any',optional: false},
  {name: 'Service',title: "Service",type: 'Any', optional: false},
  {name: 'SousDirection',title: "sous-direction",type: 'Any', optional: false},
	{name: 'AutoriteHierarchique',title: "Responsable du ou des agent(s)",type: 'Any',optional: false},
  {name: 'Description',title: "Description du projet",type: 'Text',optional: true},
  {name: 'DateDebut',title: "Date de début de la mission",type: 'Date',optional: false},
  {name: 'DateFin',title: "Date de fin de la mission",type: 'Date',optional: false},
	{name: 'Quotite',title: "Quotité du temps sur le projet (en %)",type: 'Any',optional: false},
  {name: 'Priorite',title: "Priorite du projet pour le service et la direction",type: 'Any',optional: true}
];

//Création d'un objet Projet pour simplifier le passage du tableau d'objet grist au tableau d'objet chartJS
class Projet{
	constructor(nomProjet,dateDebut,dateFin,agents,service,sousDirection, quotite,priorite){
		//this.infoSiret = infoSiret.results[0];
		this.x = [dateDebut,dateFin];
		this.y = nomProjet;
		this.Agents = agents;
		this.Service = service;
		this.SousDirection = sousDirection;
		this.Quotite = quotite;
		this.Priorite = priorite;
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
    const {ctx, data, chartArea: {top, bottom,left, rogjt} , scales: {x,y} } = chart;
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

const Agents ={
  id: 'Agents',
  beforeDatasetsDraw(chart, args, pluginOptions){
    const {ctx, data, chartArea: {top, bottom,left, rogjt} , scales: {x,y} } = chart;
    ctx.save();
    ctx.font = 'bolder 12px sans-serif';
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'middle';
    data.datasets[0].data.forEach((projet, i) => {
			if (Array.isArray(projet.Agents)){
				const n = projet.Agents.length;
				if (n==2){
					ctx.fillText(projet.Agents[0], 10,y.getPixelForValue(i)+10);
					ctx.fillText(projet.Agents[1], 10,y.getPixelForValue(i)-10);
				}else if(n==3){
					ctx.fillText(projet.Agents[0], 10,y.getPixelForValue(i)+12);
					ctx.fillText(projet.Agents[1], 10,y.getPixelForValue(i));
					ctx.fillText(projet.Agents[2], 10,y.getPixelForValue(i)-12);
				}else{
					ctx.fillText(projet.Agents, 10,y.getPixelForValue(i));
				}
			}else{
				ctx.fillText(projet.Agents, 10,y.getPixelForValue(i));
			}
    });
		ctx.fillText('Agents', 10,top-20);
    ctx.restore();
  }
}

const config = {
  type: 'bar',
  data,
  options: {
    layout:{
      padding: {
				left: 200
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
        min: dateDebutGantt.toLocaleString("en-CA",{dateStyle: "short"}),//date minimal affichée
        max: dateFinGantt.toLocaleString("en-CA",{dateStyle: "short"})//date maximal affichée
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
  plugins: [LigneJour, Agents]
};

// ==========================================
// ==== fonctions pour changer les mois =====
// ==========================================

function moisPrecedent(){
  dateDebutGantt.setMonth(dateDebutGantt.getMonth() -1);
  dateFinGantt.setMonth(dateFinGantt.getMonth() -1);

	diagrammeGantt.config.options.scales.x.min = formatageDate(dateDebutGantt); //dateDebutGantt.toLocaleString("en-CA",{dateStyle: "short"});
  diagrammeGantt.config.options.scales.x.max = formatageDate(dateFinGantt); //dateFinGantt.toLocaleString("en-CA",{dateStyle: "short"});
  diagrammeGantt.update();

}
function moisSuivant(){
  dateDebutGantt.setMonth(dateDebutGantt.getMonth() +1);
  dateFinGantt.setMonth(dateFinGantt.getMonth() +1);

	diagrammeGantt.config.options.scales.x.min = formatageDate(dateDebutGantt); //dateDebutGantt.toLocaleString("en-CA",{dateStyle: "short"});
  diagrammeGantt.config.options.scales.x.max = formatageDate(dateFinGantt); //dateFinGantt.toLocaleString("en-CA",{dateStyle: "short"});
  diagrammeGantt.update();

}

function moisMilieu(date){
	ajouteMoisDate (date, dateDebutGantt, -4)
	ajouteMoisDate (date, dateFinGantt, 4)

	diagrammeGantt.config.options.scales.x.min = formatageDate(dateDebutGantt); //dateDebutGantt.toLocaleString("en-CA",{dateStyle: "short"});
  diagrammeGantt.config.options.scales.x.max = formatageDate(dateFinGantt); //dateFinGantt.toLocaleString("en-CA",{dateStyle: "short"});
  diagrammeGantt.update();
}

function formatageDate(date){
	// retour la date sous le format "2025-09-03" en ayant en entrée un objet Date()
	return date.toLocaleString("en-CA",{dateStyle: "short"});
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
		link.download = `${formatageDate(new Date())}_Diagramme-Gantt.jpg`;
    link.href = diagrammeGantt.toBase64Image('image/jpeg', 1);
    link.click();
}

function telechargementPNG() {
    var link = document.createElement("a");
		link.download = `${formatageDate(new Date())}_Diagramme-Gantt.png`;
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

	labels.push(`Date debut : ${formatageDate(data.x[0])}`); 
	labels.push(`Date fin : ${formatageDate(data.x[1])}`); 
	if (Array.isArray(data.Agents)){
		if (data.Agents.length){
			labels.push('liste des agents :');
			data.Agents.forEach ((agent, i)=>{
				labels.push(` - ${agent}`);
			});
		}
	}
	if (data.Quotite){
		labels.push(`Quotite : ${data.Quotite * 100} %`); 
	}
	if (!data.Priorite){
		labels.push("pas de Priorite renseigné");
	}
	return labels;
}

// ====================================
// ==== fonctions propres à Grist =====
// ====================================

function creerlisteProjets(tableauGrist, tableauProjets, colonnes){
	let projet = null;
	tableauGrist.forEach((ligne, i) => {
		projet = new Projet(ligne[colonnes.Projet],
			ligne[colonnes.DateDebut],
			ligne[colonnes.DateFin],
			ligne[colonnes.Agents],
			ligne[colonnes.Service],
			ligne[colonnes.SousDirection],
			ligne[colonnes.Quotite],
			ligne[colonnes.Priorite]);
		tableauProjets.push(projet);
		if(Array.isArray(projet.Agents)){
			if (projet.Agents.length > nbMaxAgents){
				nbMaxAgents = projet.Agents.length;
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
}

creationDiagrammeGantt();
