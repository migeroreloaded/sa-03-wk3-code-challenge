// Your code here
document.addEventListener('DOMContentLoaded', () => {
    // Assigning DOM elements to variables for easy access
    const movieTitle = document.getElementById('films');
    const poster = document.getElementById('poster');
    const title = document.getElementById('title');
    const runtime = document.getElementById('runtime');
    const description = document.getElementById('film-info');
    const showtime = document.getElementById('showtime');
    const ticketNum = document.getElementById('ticket-num');
    const buyButton = document.getElementById('buy-ticket');

    // Function to buy a ticket
    function performTicketPurchase(film) {
        // Parsing the available ticket number from the ticketNum element
        let availableTickets = parseInt(ticketNum.textContent);
        
        console.log(`Bought ticket for film ${film.id} `);
        // Checking if there are available tickets
        if (availableTickets > 0) {
            // Decreasing the available ticket count by one
            availableTickets--;
            film.tickets_sold++;
            // Updating the displayed ticket number
            ticketNum.textContent = availableTickets;
            // Sending a PATCH request to update tickets_sold for the current film
            fetch(`http://localhost:3000/films/${film.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tickets_sold: film.tickets_sold
                })
            })
            .then(response => response.json())
            .then(updatedFilm => {
                // Updating the film object with the updated tickets_sold value
                film.tickets_sold = updatedFilm.tickets_sold;
                console.log('Ticket purchased successfully!');

                // Update buy button based on availability
                if (availableTickets === 0) {
                    buyButton.textContent = 'Sold Out';
                    buyButton.disabled = true;
                }

            })
            .catch(error => console.error('Error purchasing ticket:', error));
        } else {
            // Alerting the user if there are no available tickets
            alert('There are no available tickets for this film. Please try another film.');
        }
        console.log('End of process');
    }

    // Fetch film data from the server
    fetch('http://localhost:3000/films')
    .then(response => response.json())
    .then(films => {
        // Clearing the existing movie title list
        movieTitle.innerHTML = '';
        // Looping through each film fetched from the server
        films.forEach((film) => {
            // Creating a list item for each film
            const li = document.createElement('li');
            // Adding CSS classes to the list item
            li.classList.add('film', 'item');
            // Setting the text content of the list item to the film title
            li.textContent = film.title;
            // Setting a unique ID for each film item
            li.id = `film-${film.id}`;
            // Appending the list item to the movie title list
            movieTitle.appendChild(li);
            // Add "sold-out" class if tickets are sold out
            if (film.capacity - film.tickets_sold === 0) {
                li.classList.add('sold-out');
            }

            // Adding an event listener to each list item to display film details when clicked
            li.addEventListener('click', () => displayFilmDetails(film));

            // Add delete button next to each film
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent li click event from firing
                deleteFilm(film.id);
            });
            li.appendChild(deleteButton);
        });
        // Displaying details of the first film in the list by default
        if (films.length > 0) {
            displayFilmDetails(films[0]);
        }
    })
    .catch(error => console.error('Error fetching films:', error));

    // Function to display film details
    function displayFilmDetails(film) {
        // Setting the poster source, title, runtime, description, showtime, and ticket number
        poster.src = film.poster;
        title.textContent = film.title;
        runtime.textContent = `${film.runtime} minutes`;
        description.textContent = film.description;
        showtime.textContent = film.showtime;
        ticketNum.textContent = film.capacity - film.tickets_sold;

        // Update buy button based on availability
        if (film.capacity - film.tickets_sold > 0) {
            buyButton.textContent = 'Buy Ticket';
            buyButton.disabled = false;
        } else {
            buyButton.textContent = 'Sold Out';
            buyButton.disabled = true;
        }
        // Define a new function that calls `performTicketPurchase` for the given film
        function handleBuyButtonClick() {
            performTicketPurchase(film);
        }

        // Adding an event listener to the buy button to execute performTicketPurchase function with the current film
        buyButton.removeEventListener('click', handleBuyButtonClick); // Remove previous event listener
        buyButton.addEventListener('click', handleBuyButtonClick);

        console.log(`Film number ${film.id} has been selected`);
    };

    // Function to delete a film
    function deleteFilm(filmId) {
        fetch(`http://localhost:3000/films/${filmId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(() => {
            // Remove the film from the UI
            const filmItem = document.getElementById(`film-${filmId}`);
            if (filmItem) {
                filmItem.remove();
            }
            console.log('Film deleted successfully!');
        })
        .catch(error => console.error('Error deleting film:', error));
    }
});
