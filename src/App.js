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
    for (var booking of bookings){
        formattedBookings[booking.Day] = {'DoW': booking.DoW, 'Booking': booking.Booking}
    }
    return formattedBookings
}

const formatDate = (dateString) => {
    const dateSplitReversed = dateString.split("-").reverse();
    return dateSplitReversed.join("/");
}



function App() {
    const [ formattedBookings, setFormattedBookings ] = useState([]);
    const [ selectedDate, setSelectedDate ] = useState("");
    const [ statusMessage, setStatusMessage ] = useState("");

    const isSelectedDateAvailable = (rawDateString, formattedDate) => {
        const dateToday = new Date();
        const selDate = new Date(rawDateString);

        if (selDate < dateToday){
            return false;
        }

        if (formattedDate in formattedBookings){
            return false;
        }

        return true;
    }

    const onDateChange = (e) => {
        const rawDateString = e.target.value;
        const formattedDate = formatDate(rawDateString);
        setSelectedDate(formattedDate);

        if (isSelectedDateAvailable(rawDateString, formattedDate)){
            setStatusMessage("Date is available");
        }
        else {
            setStatusMessage("Date is unavailable");
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
                      <p><b>{formattedBookings[date].DoW}</b> {date}</p>
                      <p>{formattedBookings[date].Booking}</p>
                    </div>
                )
            }
        </div>
    );
}

export default App;
