/**
 * Family Tree Tracker SPA
 * Main JavaScript file handling all functionality
 */

class FamilyTreeTracker {
    constructor() {
        this.persons = new Map();
        this.currentEditingId = null;
        this.currentRelationshipsId = null;
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.loadFromLocalStorage();
        this.syncAllMarriageDates();
        this.bindEvents();
        this.renderPersonsList();
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Add person button
        document.getElementById('addPersonBtn').addEventListener('click', () => {
            this.openPersonModal();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        // Import button
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        // Import file change
        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Person form submit
        document.getElementById('personForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePerson();
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closePersonModal();
        });

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.style.display = 'none';
            });
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    /**
     * Generate a unique ID for a person
     */
    generateId() {
        return 'person_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Create a new person object
     */
    createPerson(data) {
        return {
            id: this.generateId(),
            surname: data.surname || '',
            firstNames: data.firstNames || '',
            dateOfBirth: data.dateOfBirth || '',
            dateOfDeath: data.dateOfDeath || '',
            marriageDate: data.marriageDate || '',
            gender: data.gender || '',
            relationships: {
                father: null,
                mother: null,
                siblings: [],
                partner: null,
                children: []
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * Open the person modal for adding/editing
     */
    openPersonModal(personId = null) {
        const modal = document.getElementById('personModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('personForm');
        
        this.currentEditingId = personId;
        
        if (personId) {
            modalTitle.textContent = 'Edit Person';
            const person = this.persons.get(personId);
            if (person) {
                form.surname.value = person.surname;
                form.firstNames.value = person.firstNames;
                form.dateOfBirth.value = person.dateOfBirth;
                form.dateOfDeath.value = person.dateOfDeath;
                form.marriageDate.value = person.marriageDate || '';
                form.gender.value = person.gender;
            }
        } else {
            modalTitle.textContent = 'Add New Person';
            form.reset();
        }
        
        modal.style.display = 'block';
    }

    /**
     * Close the person modal
     */
    closePersonModal() {
        document.getElementById('personModal').style.display = 'none';
        this.currentEditingId = null;
    }

    /**
     * Validate and format a date input (supports year, year-month, or full date)
     */
    validateAndFormatDate(dateString) {
        if (!dateString || dateString.trim() === '') return '';
        
        const trimmed = dateString.trim();
        
        // Match year only (4 digits)
        if (/^\d{4}$/.test(trimmed)) {
            return trimmed;
        }
        
        // Match year-month (YYYY-MM format)
        if (/^\d{4}-\d{1,2}$/.test(trimmed)) {
            const [year, month] = trimmed.split('-');
            const monthNum = parseInt(month, 10);
            if (monthNum >= 1 && monthNum <= 12) {
                return `${year}-${month.padStart(2, '0')}`;
            }
        }
        
        // Match full date (YYYY-MM-DD format)
        if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) {
            const [year, month, day] = trimmed.split('-');
            const monthNum = parseInt(month, 10);
            const dayNum = parseInt(day, 10);
            if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }
        
        // Return original if no valid format found
        return trimmed;
    }

    /**
     * Format date for display
     */
    formatDateForDisplay(dateString) {
        if (!dateString) return '';
        
        // Year only
        if (/^\d{4}$/.test(dateString)) {
            return dateString;
        }
        
        // Year-month
        if (/^\d{4}-\d{2}$/.test(dateString)) {
            const [year, month] = dateString.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
        }
        
        // Full date
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${parseInt(day, 10)} ${monthNames[parseInt(month, 10) - 1]} ${year}`;
        }
        
        // Return as-is if unrecognized format
        return dateString;
    }

    /**
     * Save person (create or update)
     */
    savePerson() {
        const form = document.getElementById('personForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Validate and format dates
        const dateOfBirth = this.validateAndFormatDate(data.dateOfBirth);
        const dateOfDeath = this.validateAndFormatDate(data.dateOfDeath);
        const marriageDate = this.validateAndFormatDate(data.marriageDate);

        if (this.currentEditingId) {
            // Update existing person
            const person = this.persons.get(this.currentEditingId);
            if (person) {
                Object.assign(person, {
                    surname: data.surname,
                    firstNames: data.firstNames,
                    dateOfBirth: dateOfBirth,
                    dateOfDeath: dateOfDeath,
                    marriageDate: marriageDate,
                    gender: data.gender,
                    updatedAt: new Date().toISOString()
                });
                
                // Synchronize marriage date with partner if they have one
                if (person.relationships.partner) {
                    const partner = this.persons.get(person.relationships.partner);
                    if (partner) {
                        this.synchronizeMarriageDates(person, partner);
                    }
                }
            }
        } else {
            // Create new person
            const personData = {
                ...data,
                dateOfBirth: dateOfBirth,
                dateOfDeath: dateOfDeath,
                marriageDate: marriageDate
            };
            const person = this.createPerson(personData);
            this.persons.set(person.id, person);
        }

        this.saveToLocalStorage();
        this.renderPersonsList();
        this.closePersonModal();
    }

    /**
     * Delete a person
     */
    deletePerson(personId) {
        if (confirm('Are you sure you want to delete this person? This will also remove all their relationships.')) {
            // Remove relationships with this person
            this.persons.forEach(person => {
                if (person.relationships.father === personId) {
                    person.relationships.father = null;
                }
                if (person.relationships.mother === personId) {
                    person.relationships.mother = null;
                }
                if (person.relationships.partner === personId) {
                    person.relationships.partner = null;
                }
                person.relationships.siblings = person.relationships.siblings.filter(id => id !== personId);
                person.relationships.children = person.relationships.children.filter(id => id !== personId);
            });

            this.persons.delete(personId);
            this.saveToLocalStorage();
            this.renderPersonsList();
        }
    }

    /**
     * Open relationships modal
     */
    openRelationshipsModal(personId) {
        this.currentRelationshipsId = personId;
        const modal = document.getElementById('relationshipsModal');
        this.renderRelationshipsContent();
        modal.style.display = 'block';
    }

    /**
     * Render relationships content
     */
    renderRelationshipsContent() {
        const content = document.getElementById('relationshipsContent');
        const person = this.persons.get(this.currentRelationshipsId);
        
        if (!person) return;

        const otherPersons = Array.from(this.persons.values()).filter(p => p.id !== person.id);

        content.innerHTML = `
            <h3>${person.firstNames} ${person.surname} - Relationships</h3>
            
            <div class="relationship-section">
                <h4>Father</h4>
                <select class="relationship-select" data-type="father">
                    <option value="">Select Father</option>
                    ${otherPersons.filter(p => p.gender === 'Male').map(p => 
                        `<option value="${p.id}" ${person.relationships.father === p.id ? 'selected' : ''}>
                            ${this.getPersonFullNameWithDates(p)}
                        </option>`
                    ).join('')}
                </select>
            </div>

            <div class="relationship-section">
                <h4>Mother</h4>
                <select class="relationship-select" data-type="mother">
                    <option value="">Select Mother</option>
                    ${otherPersons.filter(p => p.gender === 'Female').map(p => 
                        `<option value="${p.id}" ${person.relationships.mother === p.id ? 'selected' : ''}>
                            ${this.getPersonFullNameWithDates(p)}
                        </option>`
                    ).join('')}
                </select>
            </div>

            <div class="relationship-section">
                <h4>Partner</h4>
                <select class="relationship-select" data-type="partner">
                    <option value="">Select Partner</option>
                    ${otherPersons.map(p => 
                        `<option value="${p.id}" ${person.relationships.partner === p.id ? 'selected' : ''}>
                            ${this.getPersonFullNameWithDates(p)}
                        </option>`
                    ).join('')}
                </select>
            </div>

            <div class="relationship-section">
                <h4>Siblings</h4>
                <select class="relationship-select" data-type="siblings">
                    <option value="">Add Sibling</option>
                    ${otherPersons.filter(p => !person.relationships.siblings.includes(p.id)).map(p => 
                        `<option value="${p.id}">${this.getPersonFullNameWithDates(p)}</option>`
                    ).join('')}
                </select>
                <div class="relationship-list">
                    ${person.relationships.siblings.map(siblingId => {
                        const sibling = this.persons.get(siblingId);
                        return sibling ? `
                            <div class="relationship-tag">
                                ${sibling.firstNames} ${sibling.surname}
                                <span class="remove" data-type="siblings" data-id="${siblingId}">×</span>
                            </div>
                        ` : '';
                    }).join('')}
                </div>
            </div>

            <div class="relationship-section">
                <h4>Children</h4>
                <select class="relationship-select" data-type="children">
                    <option value="">Add Child</option>
                    ${otherPersons.filter(p => !person.relationships.children.includes(p.id)).map(p => 
                        `<option value="${p.id}">${this.getPersonFullNameWithDates(p)}</option>`
                    ).join('')}
                </select>
                <div class="relationship-list">
                    ${person.relationships.children.map(childId => {
                        const child = this.persons.get(childId);
                        return child ? `
                            <div class="relationship-tag">
                                ${child.firstNames} ${child.surname}
                                <span class="remove" data-type="children" data-id="${childId}">×</span>
                            </div>
                        ` : '';
                    }).join('')}
                </div>
            </div>

            <div class="form-actions">
                <button type="button" class="btn btn-primary" onclick="document.getElementById('relationshipsModal').style.display = 'none'">Done</button>
            </div>
        `;

        // Bind relationship events
        this.bindRelationshipEvents();
    }

    /**
     * Bind relationship modal events
     */
    bindRelationshipEvents() {
        // Handle relationship selects
        document.querySelectorAll('.relationship-select').forEach(select => {
            select.addEventListener('change', (e) => {
                this.updateRelationship(e.target.dataset.type, e.target.value);
            });
        });

        // Handle relationship removes
        document.querySelectorAll('.relationship-tag .remove').forEach(removeBtn => {
            removeBtn.addEventListener('click', (e) => {
                this.removeRelationship(e.target.dataset.type, e.target.dataset.id);
            });
        });
    }

    /**
     * Synchronize marriage dates between partners
     */
    synchronizeMarriageDates(person1, person2) {
        // If one person has a marriage date and the other doesn't, copy it
        if (person1.marriageDate && !person2.marriageDate) {
            person2.marriageDate = person1.marriageDate;
        } else if (person2.marriageDate && !person1.marriageDate) {
            person1.marriageDate = person2.marriageDate;
        }
        // If both have different marriage dates, keep the more complete one (or the first one's)
        // This handles the case where dates might have different levels of precision
    }

    /**
     * Synchronize marriage dates for all existing partner relationships
     */
    syncAllMarriageDates() {
        this.persons.forEach(person => {
            if (person.relationships.partner) {
                const partner = this.persons.get(person.relationships.partner);
                if (partner) {
                    this.synchronizeMarriageDates(person, partner);
                }
            }
        });
        // Save after syncing
        this.saveToLocalStorage();
    }

    /**
     * Update a relationship
     */
    updateRelationship(type, targetId) {
        const person = this.persons.get(this.currentRelationshipsId);
        if (!person) return;

        if (type === 'father' || type === 'mother' || type === 'partner') {
            // Remove old relationship first
            const oldId = person.relationships[type];
            if (oldId) {
                const oldPerson = this.persons.get(oldId);
                if (oldPerson) {
                    if (type === 'partner') {
                        oldPerson.relationships.partner = null;
                    } else if (type === 'father' || type === 'mother') {
                        oldPerson.relationships.children = oldPerson.relationships.children.filter(id => id !== person.id);
                    }
                }
            }

            // Set new relationship
            person.relationships[type] = targetId || null;

            // Update reciprocal relationship
            if (targetId) {
                const targetPerson = this.persons.get(targetId);
                if (targetPerson) {
                    if (type === 'partner') {
                        targetPerson.relationships.partner = person.id;
                        // Synchronize marriage dates between partners
                        this.synchronizeMarriageDates(person, targetPerson);
                    } else if (type === 'father' || type === 'mother') {
                        if (!targetPerson.relationships.children.includes(person.id)) {
                            targetPerson.relationships.children.push(person.id);
                        }
                    }
                }
            }
        } else if (type === 'siblings' || type === 'children') {
            if (targetId && !person.relationships[type].includes(targetId)) {
                person.relationships[type].push(targetId);

                // Update reciprocal relationship
                const targetPerson = this.persons.get(targetId);
                if (targetPerson) {
                    if (type === 'siblings') {
                        if (!targetPerson.relationships.siblings.includes(person.id)) {
                            targetPerson.relationships.siblings.push(person.id);
                        }
                    } else if (type === 'children') {
                        if (person.gender === 'Male') {
                            targetPerson.relationships.father = person.id;
                        } else if (person.gender === 'Female') {
                            targetPerson.relationships.mother = person.id;
                        }
                    }
                }
            }
        }

        this.saveToLocalStorage();
        this.renderRelationshipsContent();
        this.renderPersonsList();
    }

    /**
     * Remove a relationship
     */
    removeRelationship(type, targetId) {
        const person = this.persons.get(this.currentRelationshipsId);
        if (!person) return;

        person.relationships[type] = person.relationships[type].filter(id => id !== targetId);

        // Update reciprocal relationship
        const targetPerson = this.persons.get(targetId);
        if (targetPerson) {
            if (type === 'siblings') {
                targetPerson.relationships.siblings = targetPerson.relationships.siblings.filter(id => id !== person.id);
            } else if (type === 'children') {
                if (person.gender === 'Male') {
                    targetPerson.relationships.father = null;
                } else if (person.gender === 'Female') {
                    targetPerson.relationships.mother = null;
                }
            }
        }

        this.saveToLocalStorage();
        this.renderRelationshipsContent();
        this.renderPersonsList();
    }

    /**
     * Get person's full name
     */
    getPersonFullName(person) {
        return `${person.firstNames} ${person.surname}`.trim();
    }

    /**
     * Get person's full name with dates for dropdown selection
     */
    getPersonFullNameWithDates(person) {
        const name = this.getPersonFullName(person);
        const birth = person.dateOfBirth;
        const death = person.dateOfDeath;
        
        if (birth && death) {
            return `${name} (${this.formatDateForDisplay(birth)} - ${this.formatDateForDisplay(death)})`;
        } else if (birth) {
            return `${name} (b. ${this.formatDateForDisplay(birth)})`;
        } else if (death) {
            return `${name} (d. ${this.formatDateForDisplay(death)})`;
        } else {
            return name;
        }
    }

    /**
     * Get relationship summary for a person
     */
    getRelationshipSummary(person) {
        const relationships = [];
        
        if (person.relationships.father) {
            const father = this.persons.get(person.relationships.father);
            if (father) relationships.push(`Father: ${this.getPersonFullNameWithDates(father)}`);
        }
        
        if (person.relationships.mother) {
            const mother = this.persons.get(person.relationships.mother);
            if (mother) relationships.push(`Mother: ${this.getPersonFullNameWithDates(mother)}`);
        }
        
        if (person.relationships.partner) {
            const partner = this.persons.get(person.relationships.partner);
            if (partner) {
                let partnerInfo = `Partner: ${this.getPersonFullNameWithDates(partner)}`;
                if (person.marriageDate) {
                    partnerInfo += ` (m. ${this.formatDateForDisplay(person.marriageDate)})`;
                }
                relationships.push(partnerInfo);
            }
        }
        
        if (person.relationships.siblings.length > 0) {
            const siblings = person.relationships.siblings
                .map(id => this.persons.get(id))
                .filter(p => p)
                .map(p => this.getPersonFullNameWithDates(p));
            if (siblings.length > 0) {
                relationships.push(`Siblings: ${siblings.join(', ')}`);
            }
        }
        
        if (person.relationships.children.length > 0) {
            const children = person.relationships.children
                .map(id => this.persons.get(id))
                .filter(p => p)
                .map(p => this.getPersonFullNameWithDates(p));
            if (children.length > 0) {
                relationships.push(`Children: ${children.join(', ')}`);
            }
        }
        
        return relationships;
    }

    /**
     * Render the persons list
     */
    renderPersonsList() {
        const container = document.getElementById('personsList');
        
        if (this.persons.size === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No family members yet</h3>
                    <p>Start building your family tree by adding your first person.</p>
                    <button class="btn btn-primary" onclick="familyTracker.openPersonModal()">Add First Person</button>
                </div>
            `;
            return;
        }

        const personsArray = Array.from(this.persons.values());
        personsArray.sort((a, b) => a.surname.localeCompare(b.surname) || a.firstNames.localeCompare(b.firstNames));

        container.innerHTML = personsArray.map(person => {
            const relationships = this.getRelationshipSummary(person);
            
            return `
                <div class="person-card">
                    <div class="person-header">
                        <div>
                            <div class="person-name">${this.getPersonFullName(person)}</div>
                        </div>
                        <div class="person-gender ${person.gender.toLowerCase()}">${person.gender}</div>
                    </div>
                    
                    <div class="person-details">
                        ${person.dateOfBirth ? `<div class="person-detail"><strong>Born:</strong> ${this.formatDateForDisplay(person.dateOfBirth)}</div>` : ''}
                        ${person.dateOfDeath ? `<div class="person-detail"><strong>Died:</strong> ${this.formatDateForDisplay(person.dateOfDeath)}</div>` : ''}
                        ${person.marriageDate ? `<div class="person-detail"><strong>Married:</strong> ${this.formatDateForDisplay(person.marriageDate)}</div>` : ''}
                    </div>

                    ${relationships.length > 0 ? `
                        <div class="relationships-section">
                            <div class="relationships-title">Relationships</div>
                            ${relationships.map(rel => `<div class="relationship-item">${rel}</div>`).join('')}
                        </div>
                    ` : ''}

                    <div class="person-actions">
                        <button class="btn btn-secondary btn-small" onclick="familyTracker.openPersonModal('${person.id}')">Edit</button>
                        <button class="btn btn-secondary btn-small" onclick="familyTracker.openRelationshipsModal('${person.id}')">Relationships</button>
                        <button class="btn btn-danger btn-small" onclick="familyTracker.deletePerson('${person.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Save data to local storage
     */
    saveToLocalStorage() {
        const data = {
            persons: Array.from(this.persons.entries()),
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('familyTreeData', JSON.stringify(data));
    }

    /**
     * Load data from local storage
     */
    loadFromLocalStorage() {
        const data = localStorage.getItem('familyTreeData');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.persons = new Map(parsed.persons || []);
            } catch (error) {
                console.error('Error loading data from localStorage:', error);
                this.persons = new Map();
            }
        }
    }

    /**
     * Export data as JSON
     */
    exportData() {
        const data = {
            persons: Array.from(this.persons.entries()),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `family_tree_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Import data from JSON file
     */
    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.persons && Array.isArray(data.persons)) {
                    if (confirm('This will replace all current data. Are you sure you want to import?')) {
                        this.persons = new Map(data.persons);
                        this.saveToLocalStorage();
                        this.renderPersonsList();
                        alert('Data imported successfully!');
                    }
                } else {
                    alert('Invalid file format. Please select a valid family tree JSON file.');
                }
            } catch (error) {
                console.error('Error importing data:', error);
                alert('Error importing file. Please check the file format.');
            }
        };
        
        reader.readAsText(file);
        
        // Reset the input
        document.getElementById('importFile').value = '';
    }
}

// Initialize the application when DOM is loaded
let familyTracker;
document.addEventListener('DOMContentLoaded', () => {
    familyTracker = new FamilyTreeTracker();
}); 