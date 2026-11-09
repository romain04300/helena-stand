// ==============================
// RÉGLAGES PAR DÉFAUT
// (Hélèna peut les changer dans son espace : 5 appuis rapides sur le logo)
// ==============================
const reglagesParDefaut = {
    prixFlash: "20",
    creneaux: "10h00, 10h30, 11h00, 11h30, 14h00, 14h30, 15h00, 15h30, 16h00, 16h30",
    code: "2026",
};

const maitres = [11, 22, 33, 44];

const forces = {
    // "le nom : force 1, force 2 : frein"
    1: "le Leader : Audace, Leadership : Impatience",
    2: "le Diplomate : Écoute, Diplomatie : Effacement",
    3: "l'Artiste : Créativité, Joie : Dispersion",
    4: "le Bâtisseur : Fiabilité, Persévérance : Rigidité",
    5: "l'Aventurier : Liberté, Curiosité : Instabilité",
    6: "le Protecteur : Bienveillance, Harmonie : Sacrifice",
    7: "le Chercheur : Profondeur, Sagesse : Isolement",
    8: "le Stratège : Puissance, Réussite : Contrôle",
    9: "l'Humaniste : Générosité, Humanisme : Désillusion",
    11: "l'Éveilleur : Intuition, Inspiration : Dépendance",
    22: "l'Architecte : Solidité, Accomplissement : Intransigeance",
    33: "le Guérisseur : Compassion, Rayonnement : Hypercontrôle",
    44: "le Réformateur : Maîtrise, Endurance : Marginalité",
};

const DELAI_INACTIVITE = 60;   // secondes avant le retour automatique à l'accueil
const LIEN_SUMUP = "https://helena-fuma-numerologie-karmique-et-psychogenealogie.sumupstore.com/";


// ==============================
// LA MÉMOIRE DE LA TABLETTE (fonctionne sans Internet)
// ==============================
function lire(cle, valeurParDefaut) {
    try {
        let texte = localStorage.getItem(cle);
        return texte ? JSON.parse(texte) : valeurParDefaut;
    } catch (e) {
        return valeurParDefaut;
    }
}

function ecrire(cle, valeur) {
    try {
        localStorage.setItem(cle, JSON.stringify(valeur));
        return true;
    } catch (e) {
        return false;
    }
}

let reglages = Object.assign({}, reglagesParDefaut, lire("hf-reglages", {}));
let cheminActuel = null;   // le chemin de vie de la visiteuse en cours


// ==============================
// FRÉQUENTATION : COMPTEURS
// ==============================
function compter(cle) {
    let stats = lire("hf-stats", {});
    if (!stats.depuis) {
        stats.depuis = new Date().toLocaleDateString("fr-FR");
    }
    stats[cle] = (stats[cle] || 0) + 1;
    ecrire("hf-stats", stats);
}

function compterChemin(total) {
    let stats = lire("hf-stats", {});
    stats.chemins = stats.chemins || {};
    stats.chemins[total] = (stats.chemins[total] || 0) + 1;
    ecrire("hf-stats", stats);
}

// Transforme « Maxime + 05/03/1990 » en un code illisible (on ne garde ni le prénom ni la date)
function empreinte(texte) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < texte.length; i++) {
        let c = texte.charCodeAt(i);
        h1 = Math.imul(h1 ^ c, 2654435761);
        h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

// Compte une personne UNE SEULE FOIS : même prénom + même date = même personne
function compterPersonne(prenom, jour, mois, annee) {
    let prenomPropre = prenom.trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")   // enlève les accents : Hélèna = helena
        .replace(/\s+/g, " ");                               // espaces en trop
    let cle = empreinte(prenomPropre + "|" + jour + "-" + mois + "-" + annee);
    let stats = lire("hf-stats", {});
    if (!stats.depuis) {
        stats.depuis = new Date().toLocaleDateString("fr-FR");
    }
    stats.personnes = stats.personnes || [];
    if (!stats.personnes.includes(cle)) {
        stats.personnes.push(cle);
    }
    ecrire("hf-stats", stats);
}

function commencer() {
    compter("visites");
    allerA("saisie");
}

function voirOffres() {
    compter("offres");
    allerA("offres");
}


// ==============================
// NAVIGATION ENTRE LES PAGES
// ==============================
function allerA(page) {
    for (let section of document.querySelectorAll("section")) {
        section.classList.add("cachee");
    }
    document.getElementById(page).classList.remove("cachee");
    window.scrollTo(0, 0);
}

// Efface tout ce que la visiteuse a tapé et revient à l'accueil
function recommencer() {
    for (let champ of document.querySelectorAll("input")) {
        if (champ.type === "checkbox") {
            champ.checked = false;
        } else {
            champ.value = "";
        }
    }
    for (let menu of document.querySelectorAll("select")) {
        menu.selectedIndex = 0;
    }
    for (let erreur of document.querySelectorAll(".erreur")) {
        erreur.textContent = "";
    }
    cheminActuel = null;
    allerA("accueil");
}


// ==============================
// PAGE SAISIE : LES MENUS DE LA DATE
// ==============================
function remplirDates() {
    for (let j = 1; j <= 31; j++) {
        document.getElementById("jour").innerHTML += "<option>" + j + "</option>";
    }
    let nomsMois = ["janvier", "février", "mars", "avril", "mai", "juin",
                    "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    for (let m = 1; m <= 12; m++) {
        document.getElementById("mois").innerHTML += '<option value="' + m + '">' + nomsMois[m - 1] + "</option>";
    }
    for (let a = 2012; a >= 1930; a--) {
        document.getElementById("annee").innerHTML += "<option>" + a + "</option>";
    }
}


// ==============================
// LE CALCUL DU CHEMIN DE VIE (ton code Python, traduit)
// ==============================
function calculerChemin(date) {
    let total = 0;
    for (let chiffre of date) {
        total = total + parseInt(chiffre);
    }
    while (total > 9 && !maitres.includes(total)) {
        let texte = String(total);
        total = parseInt(texte[0]) + parseInt(texte[1]);
    }
    return total;
}


// ==============================
// BOUTON « DÉCOUVRIR »
// ==============================
function valider() {
    let prenom = document.getElementById("prenom").value.trim();
    let jour = document.getElementById("jour").value;
    let mois = document.getElementById("mois").value;
    let annee = document.getElementById("annee").value;

    if (prenom === "" || jour === "" || mois === "" || annee === "") {
        document.getElementById("erreur").textContent = "Il manque ton prénom ou ta date de naissance.";
        return;
    }
    document.getElementById("erreur").textContent = "";

    let total = calculerChemin(jour + mois + annee);
    cheminActuel = total;
    compter("calculs");
    compterChemin(total);
    compterPersonne(prenom, jour, mois, annee);
    let morceaux = forces[total].split(" : ");   // "le Leader" | "Audace, Leadership" | "Impatience"

    document.getElementById("titre-revelation").textContent = prenom + ", ton chemin de vie est";
    document.getElementById("chiffre").textContent = total;
    document.getElementById("profil").textContent = morceaux[0];
    document.getElementById("forces").textContent = "Tes forces : " + morceaux[1];
    document.getElementById("frein").textContent = "Ton frein : " + morceaux[2];

    // on prépare la page des offres
    document.getElementById("titre-ebook").textContent = "Ton e-book Chemin de Vie " + total;
    document.getElementById("prix-flash").textContent = reglages.prixFlash + " €";
    document.getElementById("flash-prenom").value = prenom;
    document.getElementById("contact-prenom").value = prenom;

    allerA("revelation");
}


// ==============================
// NUMÉROLOGIE FLASH : LISTE D'ATTENTE
// ==============================
function creneauxPris() {
    let pris = [];
    for (let personne of lire("hf-flash", [])) {
        pris.push(personne.creneau);
    }
    return pris;
}

function ouvrirFlash() {
    let menu = document.getElementById("flash-creneau");
    let pris = creneauxPris();
    let libres = 0;
    menu.innerHTML = '<option value="">Choisis un créneau</option>';
    for (let creneau of reglages.creneaux.split(",")) {
        creneau = creneau.trim();
        if (creneau !== "" && !pris.includes(creneau)) {
            menu.innerHTML += "<option>" + creneau + "</option>";
            libres = libres + 1;
        }
    }
    // s'il ne reste aucun créneau, on le dit
    if (libres === 0) {
        document.getElementById("plus-de-creneau").classList.remove("cachee");
    } else {
        document.getElementById("plus-de-creneau").classList.add("cachee");
    }
    allerA("flash");
}

function inscrireFlash() {
    let prenom = document.getElementById("flash-prenom").value.trim();
    let tel = document.getElementById("flash-tel").value;
    tel = tel.replaceAll(" ", "").replaceAll(".", "");
    let creneau = document.getElementById("flash-creneau").value;
    if (prenom === "" || creneau === "") {
        document.getElementById("erreur-flash").textContent = "Il manque ton prénom ou ton créneau.";
        return;
    }
    if (tel.length !== 10 || isNaN(tel)) {
        document.getElementById("erreur-flash").textContent = "Ton numéro doit faire 10 chiffres (ex. 06 12 34 56 78).";
        return;
    }
    if (creneauxPris().includes(creneau)) {
        document.getElementById("erreur-flash").textContent = "Ce créneau vient d'être pris, choisis-en un autre.";
        ouvrirFlash();
        return;
    }
    let liste = lire("hf-flash", []);
    liste.push({ prenom: prenom, tel: tel, creneau: creneau, chemin: cheminActuel });
    ecrire("hf-flash", liste);
    compter("flash");

    document.getElementById("titre-merci").textContent = "C'est noté, " + prenom + " !";
    document.getElementById("texte-merci").textContent = "Hélèna t'attend à " + creneau + " pour ta numérologie flash.";
    allerA("merci");
}


// ==============================
// COMMANDE : E-BOOK ET LIVRET (SUMUP)
// ==============================
let produitActuel = "";

function commander(produit) {
    produitActuel = produit;
    document.getElementById("texte-commande").textContent =
        "Ton " + produit + " Chemin de Vie " + cheminActuel;
    document.getElementById("commande-prenom").value = document.getElementById("prenom").value;
    document.getElementById("erreur-commande").textContent = "";
    document.getElementById("zone-coordonnees").classList.remove("cachee");
    document.getElementById("zone-paiement").classList.add("cachee");
    allerA("commande");
}

function validerCommande() {
    let prenom = document.getElementById("commande-prenom").value.trim();
    let email = document.getElementById("commande-email").value.trim();
    let erreur = document.getElementById("erreur-commande");

    if (prenom === "") { erreur.textContent = "Il manque ton prénom."; return; }
    if (!email.includes("@") || !email.includes(".")) { erreur.textContent = "Ton e-mail n'a pas l'air complet."; return; }

    let commandes = lire("hf-commandes", []);
    commandes.push({
        heure: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        date: new Date().toLocaleDateString("fr-FR"),
        prenom: prenom,
        email: email,
        produit: produitActuel,
        chemin: cheminActuel,
        payee: false,
    });
    ecrire("hf-commandes", commandes);

    erreur.textContent = "";
    document.getElementById("texte-commande").textContent =
        "Merci " + prenom + " ! Tu peux payer ton " + produitActuel + " ici :";
    document.getElementById("zone-coordonnees").classList.add("cachee");
    document.getElementById("zone-paiement").classList.remove("cachee");
}

function commanderEnquete(theme) {
    commander("Enquête de l'Âme : " + theme);
    document.getElementById("texte-commande").textContent = "Ton Enquête de l'Âme : " + theme;
}

function payerSurTablette() {
    window.open(LIEN_SUMUP, "_blank");
}


// ==============================
// E-BOOK : CONTACT AVEC CONSENTEMENT
// ==============================
function ouvrirContact() {
    allerA("contact");
}

function enregistrerContact() {
    let prenom = document.getElementById("contact-prenom").value.trim();
    let email = document.getElementById("contact-email").value.trim();
    let accord = document.getElementById("consentement").checked;
    let erreur = document.getElementById("erreur-contact");

    if (prenom === "") { erreur.textContent = "Il manque ton prénom."; return; }
    if (!email.includes("@") || !email.includes(".")) { erreur.textContent = "Ton e-mail n'a pas l'air complet."; return; }
    if (!accord) { erreur.textContent = "Coche la case pour recevoir des nouvelles."; return; }

    let contacts = lire("hf-contacts", []);
    contacts.push({
        prenom: prenom,
        email: email,
        chemin: cheminActuel,
        interet: "nouvelles",
        date: new Date().toLocaleString("fr-FR"),
    });
    ecrire("hf-contacts", contacts);
    compter("ebook");

    document.getElementById("titre-merci").textContent = "Merci " + prenom + " !";
    document.getElementById("texte-merci").textContent = "Hélèna te donnera bientôt de ses nouvelles par e-mail.";
    allerA("merci");
}


// ==============================
// RETOUR AUTOMATIQUE APRÈS 60 SECONDES SANS ACTION
// ==============================
let minuteur = null;

function relancerMinuteur() {
    clearTimeout(minuteur);
    minuteur = setTimeout(function () {
        let pageVisible = document.querySelector("section:not(.cachee)").id;
        if (pageVisible !== "accueil" && pageVisible !== "admin") {
            recommencer();
        }
    }, DELAI_INACTIVITE * 1000);
}

for (let evenement of ["click", "touchstart", "keydown", "input"]) {
    document.addEventListener(evenement, relancerMinuteur);
}


// ==============================
// ESPACE HÉLÈNA : 5 APPUIS RAPIDES SUR LE LOGO
// ==============================
let appuis = 0;
let minuteurAppuis = null;

document.getElementById("logo").addEventListener("click", function () {
    appuis = appuis + 1;
    clearTimeout(minuteurAppuis);
    minuteurAppuis = setTimeout(function () { appuis = 0; }, 2000);
    if (appuis >= 5) {
        appuis = 0;
        allerA("code");
    }
});

function verifierCode() {
    if (document.getElementById("code-saisi").value === reglages.code) {
        document.getElementById("code-saisi").value = "";
        document.getElementById("erreur-code").textContent = "";
        afficherAdmin();
        allerA("admin");
    } else {
        document.getElementById("erreur-code").textContent = "Code incorrect.";
    }
}

function afficherStats() {
    let stats = lire("hf-stats", {});
    document.getElementById("stats-depuis").textContent = stats.depuis ? "Depuis le " + stats.depuis : "Aucune visite pour l'instant.";
    let lignes = [
        ["Personnes différentes (prénom + date)", (stats.personnes || []).length],
        ["Passages (appuis sur « Commencer »)", stats.visites || 0],
        ["Chemins de vie calculés", stats.calculs || 0],
        ["Ont regardé les offres", stats.offres || 0],
        ["Inscriptions numérologie flash", stats.flash || 0],
        ["Commandes payées (livret / e-book)", stats.commandes || 0],
        ["Inscriptions aux nouvelles", stats.ebook || 0],
    ];
    let zone = document.getElementById("stats");
    zone.innerHTML = "";
    for (let ligne of lignes) {
        let p = document.createElement("p");
        p.className = "stat-ligne";
        p.innerHTML = "<span></span><b></b>";
        p.querySelector("span").textContent = ligne[0];
        p.querySelector("b").textContent = ligne[1];
        zone.appendChild(p);
    }
    // les chemins de vie les plus fréquents
    let chemins = stats.chemins || {};
    let classement = Object.keys(chemins).sort(function (a, b) { return chemins[b] - chemins[a]; });
    if (classement.length > 0) {
        let p = document.createElement("p");
        p.className = "petit";
        let morceaux = [];
        for (let c of classement) {
            morceaux.push("CDV " + c + " : " + chemins[c]);
        }
        p.textContent = "Chemins de vie : " + morceaux.join(" · ");
        zone.appendChild(p);
    }
    document.getElementById("msg-stats").textContent = "";
}

let confirmationStats = false;

function exporterStatsPDF() {
    let ancienTitre = document.title;
    document.title = "Stats salon Helena " + new Date().toISOString().slice(0, 10);
    window.print();
    document.title = ancienTitre;
}

function remettreStatsAZero() {
    if (!confirmationStats) {
        confirmationStats = true;
        document.getElementById("msg-stats").textContent = "Appuie encore une fois pour confirmer.";
        setTimeout(function () { confirmationStats = false; }, 5000);
        return;
    }
    confirmationStats = false;
    ecrire("hf-stats", {});
    afficherStats();
    document.getElementById("msg-stats").textContent = "Compteurs remis à zéro.";
}

function afficherAdmin() {
    afficherStats();

    // liste d'attente flash, rangée dans l'ordre des créneaux
    let ordre = reglages.creneaux.split(",").map(function (c) { return c.trim(); });
    let liste = lire("hf-flash", []);
    liste.sort(function (a, b) { return ordre.indexOf(a.creneau) - ordre.indexOf(b.creneau); });
    let zone = document.getElementById("liste-flash");
    zone.innerHTML = "";
    if (liste.length === 0) {
        zone.innerHTML = '<p class="petit">Personne en attente.</p>';
    }
    for (let personne of liste) {
        let ligne = document.createElement("p");
        ligne.className = "ligne-attente";
        ligne.textContent = personne.creneau + " · " + personne.prenom + " · " + (personne.tel || "pas de numéro") + " (chemin de vie " + (personne.chemin || "?") + ")";
        zone.appendChild(ligne);
    }

    // commandes livret / e-book
    let commandes = lire("hf-commandes", []);
    let zoneCommandes = document.getElementById("liste-commandes");
    zoneCommandes.innerHTML = "";
    if (commandes.length === 0) {
        zoneCommandes.innerHTML = '<p class="petit">Aucune commande.</p>';
    }
    for (let i = 0; i < commandes.length; i++) {
        let c = commandes[i];
        let ligne = document.createElement("p");
        ligne.className = "ligne-attente";
        let detail = c.produit.startsWith("Enquête") ? c.produit : c.produit + " Chemin de Vie " + c.chemin;
        ligne.textContent = c.heure + " · " + c.prenom + " · " + detail + " · " + c.email + " ";

        let boutonPayee = document.createElement("button");
        boutonPayee.className = c.payee ? "mini payee" : "mini";
        boutonPayee.textContent = c.payee ? "✓ Payée" : "Marquer payée";
        boutonPayee.onclick = function () { marquerPayee(i); };
        ligne.appendChild(boutonPayee);

        let boutonSuppr = document.createElement("button");
        boutonSuppr.className = "mini secondaire";
        boutonSuppr.textContent = "Supprimer";
        boutonSuppr.onclick = function () { supprimerCommande(i); };
        ligne.appendChild(boutonSuppr);

        zoneCommandes.appendChild(ligne);
    }

    // contacts
    let contacts = lire("hf-contacts", []);
    document.getElementById("nb-contacts").textContent = contacts.length + " contact(s) enregistré(s) sur cette tablette.";
    document.getElementById("msg-contacts").textContent = "";

    // réglages
    document.getElementById("r-prix-flash").value = reglages.prixFlash;
    document.getElementById("r-creneaux").value = reglages.creneaux;
    document.getElementById("r-code").value = "";
    document.getElementById("msg-reglages").textContent = "";
}

function viderFlash() {
    ecrire("hf-flash", []);
    afficherAdmin();
}

function viderCommandes() {
    ecrire("hf-commandes", []);
    afficherAdmin();
}

function marquerPayee(i) {
    let commandes = lire("hf-commandes", []);
    commandes[i].payee = !commandes[i].payee;
    ecrire("hf-commandes", commandes);

    let stats = lire("hf-stats", {});
    if (commandes[i].payee) {
        stats.commandes = (stats.commandes || 0) + 1;
    } else {
        stats.commandes = (stats.commandes || 0) - 1;
    }
    ecrire("hf-stats", stats);
    afficherAdmin();
}

function supprimerCommande(i) {
    let commandes = lire("hf-commandes", []);
    if (commandes[i].payee) {
        let stats = lire("hf-stats", {});
        stats.commandes = (stats.commandes || 0) - 1;
        ecrire("hf-stats", stats);
    }
    commandes.splice(i, 1);
    ecrire("hf-commandes", commandes);
    afficherAdmin();
}

function exporterExcel() {
    let contacts = lire("hf-contacts", []);
    let commandes = lire("hf-commandes", []);
    let flash = lire("hf-flash", []);
    let msg = document.getElementById("msg-contacts");

    if (contacts.length === 0 && commandes.length === 0 && flash.length === 0) {
        msg.textContent = "Rien à exporter pour l'instant.";
        return;
    }

    // une ligne Excel par personne, avec des titres de colonnes clairs
    let ongletContacts = contacts.map(function (c) {
        return { "Prénom": c.prenom, "E-mail": c.email, "Chemin de vie": c.chemin, "Date": c.date };
    });
    let ongletCommandes = commandes.map(function (c) {
        return {
            "Date": c.date, "Heure": c.heure, "Prénom": c.prenom, "E-mail": c.email,
            "Produit": c.produit, "Chemin de vie": c.chemin, "Payée": c.payee ? "oui" : "non",
        };
    });
    let ongletFlash = flash.map(function (f) {
        return { "Créneau": f.creneau, "Prénom": f.prenom, "Téléphone": f.tel || "", "Chemin de vie": f.chemin };
    });

    let classeur = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(classeur, XLSX.utils.json_to_sheet(ongletContacts), "Contacts");
    XLSX.utils.book_append_sheet(classeur, XLSX.utils.json_to_sheet(ongletCommandes), "Commandes");
    XLSX.utils.book_append_sheet(classeur, XLSX.utils.json_to_sheet(ongletFlash), "Flash");
    XLSX.writeFile(classeur, "salon-helena-" + new Date().toISOString().slice(0, 10) + ".xlsx");

    msg.textContent = "Fichier Excel téléchargé. Vérifie-le avant d'effacer quoi que ce soit.";
}

let confirmationEffacement = false;

function effacerContacts() {
    if (!confirmationEffacement) {
        confirmationEffacement = true;
        document.getElementById("msg-contacts").textContent = "Appuie encore une fois sur « Effacer » pour confirmer.";
        setTimeout(function () { confirmationEffacement = false; }, 5000);
        return;
    }
    confirmationEffacement = false;
    ecrire("hf-contacts", []);
    afficherAdmin();
    document.getElementById("msg-contacts").textContent = "Contacts effacés de la tablette.";
}

function enregistrerReglages() {
    reglages.prixFlash = document.getElementById("r-prix-flash").value.trim() || reglages.prixFlash;
    reglages.creneaux = document.getElementById("r-creneaux").value.trim() || reglages.creneaux;
    let nouveauCode = document.getElementById("r-code").value.trim();
    if (nouveauCode !== "") {
        if (nouveauCode.length < 4) {
            document.getElementById("msg-reglages").textContent = "Le code doit faire au moins 4 chiffres.";
            return;
        }
        reglages.code = nouveauCode;
    }
    ecrire("hf-reglages", reglages);
    document.getElementById("r-code").value = "";
    document.getElementById("msg-reglages").textContent = "Réglages enregistrés.";
}


// ==============================
// AU DÉMARRAGE
// ==============================
remplirDates();
relancerMinuteur();

// Mémoire hors connexion (l'appli marche sans Internet après la première ouverture)
// ==============================
// MISE À JOUR : on propose la nouvelle version
// ==============================
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").then(function (inscription) {
        // une nouvelle version attend déjà
        if (inscription.waiting && navigator.serviceWorker.controller) {
            proposerMaj(inscription.waiting);
        }
        // une nouvelle version arrive pendant que l'appli est ouverte
        inscription.addEventListener("updatefound", function () {
            let nouvelle = inscription.installing;
            nouvelle.addEventListener("statechange", function () {
                if (nouvelle.state === "installed" && navigator.serviceWorker.controller) {
                    proposerMaj(nouvelle);
                }
            });
        });
        // on vérifie s'il y a du nouveau toutes les 15 minutes
        setInterval(function () { inscription.update(); }, 15 * 60 * 1000);
    });

    // quand la nouvelle version prend la main, on recharge la page une seule fois
    let dejaRecharge = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (dejaRecharge) return;
        dejaRecharge = true;
        location.reload();
    });
}

function proposerMaj(nouvelle) {
    document.getElementById("bandeau-maj").classList.remove("cachee");
    document.getElementById("bouton-maj").onclick = function () {
        nouvelle.postMessage("mettre-a-jour");
    };
}
