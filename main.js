document.addEventListener("DOMContentLoaded", () => {
    if (!window.firebase) {
        console.error("Firebase n'est pas chargé !");
    } else {
        const {app, db, analytics, addDoc, collection }  = window.firebase; // Importer Firebase
        






let currentSection = 1;
const totalSections = 5;

        // Valide les champs dans une section
function validateSection(sectionId) {
    const section = document.getElementById(sectionId);
    const inputs = section.querySelectorAll("input, textarea, select");
    let valid = true;

    inputs.forEach((input) => {
        // Supprime les messages d'erreur existants
        const error = input.nextElementSibling;
        if (error && error.classList.contains("error-message")) {
            error.remove();
        }

        // Validation des champs requis
        if (input.required && !input.value.trim()) {
            valid = false;
            showError(input, "Ce champ est obligatoire");
        
        }else if (input.required && input.type === "radio") {
            // Validation des groupes de boutons radio
            const group = section.querySelectorAll(`input[name="${input.name}"]`);
            const isChecked = Array.from(group).some((radio) => radio.checked);

            if (!isChecked) {
                valid = false;
                showError(group[group.length - 1], "Veuillez sélectionner une option");
            }
        } else if (input.type === "email" && !/^\S+@\S+\.\S+$/.test(input.value)) {
            valid = false;
            showError(input, "Veuillez entrer un email valide");
        } else if (input.type === "tel" && !/^\d+$/.test(input.value)) {
            valid = false;
            showError(input, "Le numéro de téléphone doit contenir uniquement des chiffres");
        }
    });

    return valid;
}

// Affiche un message d'erreur sous un champ
function showError(input, message) {
    const error = document.createElement("div");
    error.classList.add("error-message");
    error.style.color = "red";
    error.style.fontSize = "12px";
    error.style.marginTop = "5px";
    error.textContent = message;

    // Ajouter le message d'erreur
    input.closest("div").appendChild(error);

    // Scroller jusqu'à l'élément invalide
    input.scrollIntoView({ behavior: "smooth", block: "center" });
}


// Navigation entre les sections avec validation
window.navigateSection = function (direction) {
    const currentSectionId = `section-${currentSection}`;
    const valid = direction === 1 ? validateSection(currentSectionId) : true;

    if (valid) {
        document.getElementById(currentSectionId).classList.remove("active");
        currentSection += direction;
        document.getElementById(`section-${currentSection}`).classList.add("active");

        const prevButton = document.querySelector('.navigation-buttons button:first-child');
        const nextButton = document.querySelector('.navigation-buttons button:nth-child(2)');

        if (currentSection === 5 && direction === 1) {
            collectResponses(); // Votre fonction actuelle
}


        if (currentSection === 1) {
            prevButton.style.visibility = 'hidden';
            nextButton.textContent = 'Suivant';
        } else if (currentSection === 4) {
            nextButton.textContent = 'Envoyer';
            prevButton.style.visibility = 'visible';
        } else if (currentSection === 5) {
            nextButton.style.visibility = 'hidden';
            prevButton.style.visibility = 'hidden';
        } else {
            nextButton.textContent = 'Suivant';
            prevButton.style.visibility = 'visible';
        }
    }
}

// Confirmation pour le bouton Effacer
window.clearForm = function () {
    const modal = document.getElementById("confirmation-modal");
    modal.style.display = "flex";
}

window.confirmClear = function (isConfirmed) {
    const modal = document.getElementById("confirmation-modal");
    modal.style.display = "none";

    if (isConfirmed) {
        const form = document.querySelector(".form-container");
        const inputs = form.querySelectorAll("input, textarea, select");

        // Réinitialiser tous les champs du formulaire
        inputs.forEach((input) => {
            input.value = "";
            input.style.borderColor = "";
            const error = input.nextElementSibling;
            if (error && error.classList.contains("error-message")) {
                error.remove();
            }
        });

        // Retourner à la section 1
        document.getElementById(`section-${currentSection}`).classList.remove("active");
        currentSection = 1; // Réinitialiser la section actuelle
        document.getElementById(`section-${currentSection}`).classList.add("active");

        // Réinitialiser les boutons de navigation
        const prevButton = document.querySelector('.navigation-buttons button:first-child');
        const nextButton = document.querySelector('.navigation-buttons button:nth-child(2)');
        prevButton.style.visibility = 'hidden';
        nextButton.style.visibility = 'visible';
        nextButton.textContent = 'Suivant';
    }
}



async function collectResponses() {
    const form = document.querySelector(".form-container");
    const inputs = form.querySelectorAll("input, textarea, select");
    const responses = {};

    // Collecter les dates sélectionnées
    responses["dates"] = picker.selectedDates.map(date => date.toISOString().split('T')[0]).join(', ') || "Non renseigné";

    // Collecter les réponses des utilisateurs
    inputs.forEach((input) => {
        if (input.name) {
            if (input.type === "radio" || input.type === "checkbox") {
                if (input.checked) {
                    responses[input.name] = input.value;
                }
            } else if (input.classList.contains("date-picker")) {
                responses[input.name] = picker.selectedDates.map(date => date.toISOString().split('T')[0]).join(', ') || "Non renseigné";
            } else {
                responses[input.name] = input.value || "Non renseigné";
            }
        }
    });

    // Nettoyage des données
    if (responses['type-formation'] === 'Autre' && responses['other_input'] !== "Non renseigné") {
        responses['type-formation'] = responses['other_input'];
    }
    if (responses['theme-formation'] === 'Autre' && responses['theme_other_input'] !== "Non renseigné") {
        responses['theme-formation'] = responses['theme_other_input'];
    }

    delete responses['other_input'];
    delete responses['theme_other_input'];

    // Envoi à Firestore
    try {
        const docRef = await addDoc(collection(db, "form-submissions"), {
            ...responses,
            submissionDate: new Date().toISOString()
        });

        console.log("Document écrit avec ID :", docRef.id);
    } catch (error) {
        console.error("Erreur lors de l'ajout du document :", error);
        alert("Erreur lors de la soumission du formulaire. Veuillez réessayer plus tard");
    }
}




// Gestion des boutons radio avec les cercles pour chaque formulaire
document.querySelectorAll('form').forEach(form => {
    const radios = form.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            // Réinitialise les cercles pour tous les boutons radio du formulaire
            form.querySelectorAll('.radio-circle').forEach(circle => {
                circle.style.backgroundColor = 'transparent';
            });

            // Active le cercle correspondant au bouton radio sélectionné
            const selectedCircle = radio.nextElementSibling.querySelector('.radio-circle');
            if (selectedCircle) selectedCircle.style.backgroundColor = '#A31E21';

            // Gestion des champs texte pour "Autre"
            if (radio.id === 'other' || radio.id === 'theme-autre') {
                const relatedInput = form.querySelector(`#${radio.id === 'other' ? 'other-input' : 'theme-other-input'}`);
                relatedInput.style.display = 'block';
            } else {
                form.querySelectorAll('input[type="text"]').forEach(input => {
                    input.style.display = 'none';
                });
            }
        });
    });
});


// Liste des dates autorisées par type de formation
const availableDates = {
    "Webinaire": ["2024-12-04", "2024-12-05", "2024-12-06"],
    "Séminaire": ["2024-12-19", "2024-12-20", "2024-12-21"],
    "Masterclass": ["2024-12-12", "2024-12-13", "2024-12-16"],
    "Accompagnement personnalisé": ["2024-12-17", "2024-12-18"],
    "Autre": ["2024-12-19", "2024-12-20"]
};

// Nombre de dates à sélectionner par type de formation
const maxDatesPerType = {
    "Webinaire": 1,
    "Séminaire": 2,
    "Masterclass": 1,
    "Accompagnement personnalisé": 1,
    "Autre": 1
};

// Référence à l'élément de la question de sélection de la formation
const typeFormationForm = document.getElementById('type-formation-form');
const datePicker = document.getElementById('date-picker');

// Initialisation de flatpickr
const picker = flatpickr(datePicker, {
    dateFormat: "Y-m-d",
    minDate: "today",  // Pour limiter la sélection aux dates futures uniquement
    mode: "multiple",  // Permet la sélection de plusieurs dates
    disable: [
        function(date) {
            // Désactive toutes les dates par défaut
            return true;
        }
    ],
    // Ajout d'un événement pour limiter le nombre de dates sélectionnables
    onValueUpdate: function(selectedDates, dateStr, instance) {
        const selectedType = typeFormationForm.querySelector('input[name="type-formation"]:checked').value;
        const maxDates = maxDatesPerType[selectedType];
        
        if (selectedDates.length > maxDates) {
            // Supprimer les dates supplémentaires
            instance.clear();
            instance.setDate(selectedDates.slice(0, maxDates));
            // Afficher un message d'alerte
            alert(`Vous ne pouvez sélectionner que ${maxDates} date(s) pour ce type de formation.`);
        }

        if (selectedDates.length < maxDates && document.getElementById('date-picker').value && document.getElementById('date-picker').value.includes(',')) {
            // Afficher un message d'alerte
            alert(`Vous ne pouvez sélectionner que ${maxDates} date(s) pour ce type de formation.`);
        }
    }
});

// Écouter les changements de sélection dans le formulaire
typeFormationForm.addEventListener('change', () => {
    const selectedType = typeFormationForm.querySelector('input[name="type-formation"]:checked');

    if (selectedType) {
        const type = selectedType.value;
        const dates = availableDates[type] || [];

        // Réinitialiser les dates désactivées et activer uniquement les dates du type de formation
        picker.set('disable', [
            function(date) {
                // Convertir la date en format "YYYY-MM-DD"
                return !dates.includes(date.toISOString().split('T')[0]);
            }
        ]);

        // Réinitialiser la valeur du datepicker
        picker.clear();
    }
});


}
});