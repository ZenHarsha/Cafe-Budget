let state = {
    monthlyBudget: 0,
    expenses: [],
    dailyLimit: 0,
    remainingBudget: 0
};

document.addEventListener('DOMContentLoaded', () => {
    const landing = document.getElementById('landing');
    const app = document.getElementById('app');
    const title = document.querySelector('.landing-title');
    
    title.querySelectorAll('span').forEach((span, index) => {
        span.style.animationDelay = `${index * 0.1}s`;
    });

    setTimeout(() => {
        landing.classList.add('hide');
        app.classList.add('show');
    }, 3000);

    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });
});

function calculateDailyLimit(remainingBudget) {
    return remainingBudget / 30;
}

function formatCurrency(amount) {
    return `₹${parseFloat(amount).toFixed(2)}`;
}

function getTodaySpending() {
    const today = new Date().toDateString();
    return state.expenses
        .filter(expense => new Date(expense.date).toDateString() === today)
        .reduce((total, expense) => total + expense.amount, 0);
}

function updateUI() {
    const dailyLimit = document.getElementById('dailyLimit');
    const todaySpent = document.getElementById('todaySpent');
    const remainingBudget = document.getElementById('remainingBudget');

    animateValue(dailyLimit, parseFloat(dailyLimit.textContent.replace('₹', '')), state.dailyLimit);
    animateValue(todaySpent, parseFloat(todaySpent.textContent.replace('₹', '')), getTodaySpending());
    animateValue(remainingBudget, parseFloat(remainingBudget.textContent.replace('₹', '')), state.remainingBudget);
    
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';
    
    state.expenses.slice(0, 5).forEach((expense, index) => {
        const expenseEl = document.createElement('div');
        expenseEl.className = 'expense-item';
        expenseEl.style.animation = `slideIn 0.3s ease-out forwards ${index * 0.1}s`;
        expenseEl.innerHTML = `
            <div class="details">
                <span class="note">${expense.note}</span>
                <span class="date">${new Date(expense.date).toLocaleDateString()}</span>
            </div>
            <span class="amount">${formatCurrency(expense.amount)}</span>
        `;
        expenseList.appendChild(expenseEl);
    });
}

function animateValue(element, start, end) {
    const duration = 1000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const value = start + (end - start) * easeOutQuart(progress);
        element.textContent = formatCurrency(value);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
}

document.getElementById('setBudget').addEventListener('click', () => {
    const budgetInput = document.getElementById('monthlyBudget');
    const amount = parseFloat(budgetInput.value);
    
    if (amount > 0) {
        state.monthlyBudget = amount;
        state.dailyLimit = calculateDailyLimit(amount);
        state.remainingBudget = amount;
        updateUI();
        
        budgetInput.style.animation = 'none';
        budgetInput.offsetHeight; 
        budgetInput.style.animation = 'slideIn 0.3s ease-out';
        
        const btn = document.getElementById('setBudget');
        btn.style.animation = 'none';
        btn.offsetHeight;
        btn.style.animation = 'ripple 0.5s ease-out';
    }
});

document.getElementById('addExpense').addEventListener('click', () => {
    const amountInput = document.getElementById('expenseAmount');
    const noteInput = document.getElementById('expenseNote');
    const amount = parseFloat(amountInput.value);

    if (amount > 0 && noteInput.value.trim()) {
        // Expences add itahdhi 
        const expense = {
            amount,
            note: noteInput.value.trim(),
            date: new Date().toISOString()
        };

        // expense state ke add chayalii 
        state.expenses.unshift(expense);

        // E roju expences and vadini expences 
        const todaySpent = getTodaySpending();
        if (todaySpent > state.dailyLimit) {
            alert(`Daily limit exceeded! You spent ₹${formatCurrency(todaySpent)} today.`);
        }

        // Updating the new expences 
        state.remainingBudget -= amount;

        // Animation tho reset itadhi 
        amountInput.style.transition = 'opacity 0.3s';
        noteInput.style.transition = 'opacity 0.3s';
        amountInput.style.opacity = '0';
        noteInput.style.opacity = '0';

        setTimeout(() => {
            amountInput.value = '';
            noteInput.value = '';
            amountInput.style.opacity = '1';
            noteInput.style.opacity = '1';
        }, 300);

        updateUI();
    }
});

updateUI();
