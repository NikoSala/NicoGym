// ==========================================
        // RECORDS
        // ==========================================
        const Records = {
            getRecord(name) { return STATE.records.find(r => r.exerciseName === name); },
            actualizar(name, weight, reps, date) {
                const current = this.getRecord(name);
                if (!current || weight > current.weight || (weight === current.weight && reps > current.reps)) {
                    STATE.records = STATE.records.filter(r => r.exerciseName !== name);
                    STATE.records.push({ exerciseName: name, weight, reps, date });
                    Storage._save();
                    return true;
                }
                return false;
            },
            render() {
                const c = document.getElementById('recordsContainer');
                if (!c) return;
                if (STATE.records.length === 0) {
                    c.innerHTML =
                        `<div class="card"><div style="text-align:center;color:var(--text-secondary);padding:16px;">
                            <i class="fa-solid fa-trophy" style="font-size:36px;display:block;margin-bottom:8px;color:var(--text-muted);"></i>
                            <p style="font-size:13px;">Aún no has batido ningún récord</p>
                        </div></div>`;
                    return;
                }
                const sorted = [...STATE.records].sort((a, b) => b.weight - a.weight);
                c.innerHTML = sorted.map(r => `
                    <div class="record-card">
                        <div class="record-name">${r.exerciseName}</div>
                        <div class="record-stats">
                            <div class="rs-item"><div class="rs-label">Peso</div><div class="rs-value">${r.weight} kg</div></div>
                            <div class="rs-item"><div class="rs-label">Reps</div><div class="rs-value">${r.reps}</div></div>
                            <div class="rs-item"><div class="rs-label">Volumen</div><div class="rs-value">${r.weight * r.reps} kg</div></div>
                        </div>
                        <div class="record-date">${r.date}</div>
                    </div>
                `).join('');
            }
        };

