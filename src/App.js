import {useEffect, useState} from 'react';
import './App.css';
import { usePapaParse } from 'react-papaparse';

const getCSV = async () => {
    return fetch('/events_2022.csv')
        .then(events_data => events_data.text())
        .catch(err => console.error(err)
    )
}

const ParseCSV = (csvString) => {
    const { readString } = usePapaParse();
    return readString(csvString, {
        header: true,
        skipEmptyLines: true
    });
}

const formatCSV = (csvObject) => {
    const bookings = csvObject.data;
    var formattedBookings = {};
    var bookingDate;
    for (var booking of bookings){
        bookingDate = new Date(formatDate(booking.Day));
        formattedBookings[bookingDate] = {'LocaleFormatted': bookingDate.toLocaleDateString(), 'DoW': booking.DoW, 'Booking': booking.Booking}
    }
    return formattedBookings
}

const formatDate = (dateString) => {
    const dateSplitReversed = dateString.split("/").reverse();
    return dateSplitReversed.join("-");
}



function App() {
    const [ formattedBookings, setFormattedBookings ] = useState([]);
    const [ selectedDate, setSelectedDate ] = useState("");
    const [ statusMessage, setStatusMessage ] = useState("");

    const isSelectedDateAvailable = (selectedDate) => {
        const dateToday = new Date();

        if (selectedDate < dateToday){
            return false;
        }

        if (selectedDate in formattedBookings){
            return false;
        }

        return true;
    }

    const addDays = (date, days) => {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    const getNextAvailableDates = (selectedDate) => {
        var alternativeDateForward = new Date(selectedDate);
        var alternativeDateBackward = new Date(selectedDate);

        while (!isSelectedDateAvailable(alternativeDateBackward) && !isSelectedDateAvailable(alternativeDateForward)){
            alternativeDateBackward = addDays(alternativeDateBackward, -1);
            alternativeDateForward = addDays(alternativeDateForward, 1);
        }

        var nextAvailable = [];

        if (isSelectedDateAvailable(alternativeDateBackward)){
            nextAvailable.push(alternativeDateBackward.toLocaleDateString());
        }
        if (isSelectedDateAvailable(alternativeDateForward)){
            nextAvailable.push(alternativeDateForward.toLocaleDateString());
        }
        return nextAvailable;
    }

    const onDateChange = (e) => {
        const rawDateString = e.target.value;
        const selectedDate = new Date(rawDateString);

        setSelectedDate(selectedDate.toLocaleDateString());

        if (isSelectedDateAvailable(selectedDate)){
            setStatusMessage("Date is available");
        }
        else {
            const nextAvailable = getNextAvailableDates(selectedDate);
            setStatusMessage("Date unavailable, next available: " + nextAvailable.join(" & "));
        }
    }

    useEffect(() => {
        getCSV()
        .then(ParseCSV)
        .then(formatCSV)
        .then((formattedObject) => {
            setFormattedBookings(formattedObject)
        })
    }, [formattedBookings])


    return (
        <div className="App">
            <h1> Glasgow Events </h1>
            <input type='date' onChange={onDateChange}/>
            <p>{selectedDate}</p>
            <p>{statusMessage}</p>
            {
                Object.keys(formattedBookings).map((date, bookingIdx) =>
                    <div key={bookingIdx}>
                      <p><b>{formattedBookings[date].DoW}</b> {formattedBookings[date].LocaleFormatted}</p>
                      <p>{formattedBookings[date].Booking}</p>
                    </div>
                )
            }
        </div>
    );
}

export default App;
