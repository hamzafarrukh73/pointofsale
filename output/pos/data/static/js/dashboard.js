document.addEventListener('DOMContentLoaded', () => {
    loadOrders();  
});

let allOrders = [];

function loadOrders() {
    fetch('/history/fetch')
        .then(response => response.json())
        .then(orders => {
            allOrders = orders;
            populateOrdersTable(orders.slice(0, 10));
            updateSales(orders);  
        })
        .catch(error => console.error('Error:', error));
}

function populateOrdersTable(orders) {
    const tbody = document.getElementById('lastOrders');
    tbody.innerHTML = '';
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="no-text-wrap text-truncate">${new Date(order.created_on).toLocaleString()}</td>
            <td>${order.total.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
}

function updateSales() {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // alert(allOrders);

    // Helper function to check if two dates are the same day
    const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    };

    // Helper function to get the first day of the current week (assuming Monday as the start)
    const getFirstDayOfWeek = (date) => {
        const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
        const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(date.setDate(diff));
    };

    // Helper function to check if a date is within the current week
    const isWithinThisWeek = (orderDate) => {
        const firstDayOfWeek = getFirstDayOfWeek(new Date(currentDate));
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        return orderDate >= firstDayOfWeek && orderDate <= lastDayOfWeek;
    };

    // Helper function to check if a date is within the current month
    const isWithinThisMonth = (orderDate) => {
        return orderDate.getMonth() === currentMonth &&
               orderDate.getFullYear() === currentYear;
    };

    // Helper function to check if a date is within the last month
    const isWithinLastMonth = (orderDate) => {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return orderDate.getMonth() === lastMonth &&
               orderDate.getFullYear() === lastYear;
    };

    // Helper function to check if a date is within the current year
    const isWithinThisYear = (orderDate) => {
        return orderDate.getFullYear() === currentYear;
    };

    // Calculate Today's Sales
    const dailySales = allOrders
        .filter(order => isSameDay(new Date(order.created_on), currentDate))
        .reduce((sum, order) => sum + order.total, 0)
        .toFixed(2);
    document.getElementById('dailySales').textContent = dailySales;

    // Calculate Yesterday's Sales
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);
    const yesterdaySales = allOrders
        .filter(order => isSameDay(new Date(order.created_on), yesterday))
        .reduce((sum, order) => sum + order.total, 0)
        .toFixed(2);
    document.getElementById('yesterdaySales').textContent = yesterdaySales;

    // Calculate This Week's Sales
    const weeklySales = allOrders
        .filter(order => isWithinThisWeek(new Date(order.created_on)))
        .reduce((sum, order) => sum + order.total, 0)
        .toFixed(2);
    document.getElementById('weeklySales').textContent = weeklySales;

    // Calculate This Month's Sales
    const monthlySales = allOrders
        .filter(order => isWithinThisMonth(new Date(order.created_on)))
        .reduce((sum, order) => sum + order.total, 0)
        .toFixed(2);
    document.getElementById('monthlySales').textContent = monthlySales;

    // Calculate Last Month's Sales
    const lastMonthSales = allOrders
        .filter(order => isWithinLastMonth(new Date(order.created_on)))
        .reduce((sum, order) => sum + order.total, 0)
        .toFixed(2);
    document.getElementById('lastMonthSales').textContent = lastMonthSales;

    // Calculate This Year's Sales
    const yearlySales = allOrders
        .filter(order => isWithinThisYear(new Date(order.created_on)))
        .reduce((sum, order) => sum + order.total, 0)
        .toFixed(2);
    document.getElementById('yearlySales').textContent = yearlySales;
}

// Assuming 'allOrders' is a global variable containing your order data
// You should call updateSales() after 'allOrders' is populated.
// updateSales();