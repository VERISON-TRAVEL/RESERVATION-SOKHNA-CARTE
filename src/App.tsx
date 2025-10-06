import { useState, useEffect } from 'react';
import { Home, Grid2x2 as Grid, Calendar, Clock, Building2, Users, User, Baby, Facebook, Instagram, Send, DoorOpen } from 'lucide-react';
import { FaTiktok, FaWhatsapp } from 'react-icons/fa';

type RoomType = 'Single' | 'Double' | 'Triple' | 'Quadruple' | 'Suite';

interface AdultData {
  name: string;
  surname: string;
}

interface ChildData {
  name: string;
  surname: string;
  age: string;
}

interface Room {
  roomType: RoomType;
  adults: number;
  adultsData: AdultData[];
  children: number;
  childrenData: ChildData[];
}

function App() {
  const [agencyName, setAgencyName] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [numberOfNights, setNumberOfNights] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [rooms, setRooms] = useState<Room[]>([
    {
      roomType: 'Double',
      adults: 1,
      adultsData: [{ name: '', surname: '' }],
      children: 0,
      childrenData: []
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [dateError, setDateError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const validateDates = (checkIn: string, checkOut: string) => {
    const todayDate = new Date(today);
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate < todayDate) {
      setDateError('Check-in date cannot be in the past');
      return false;
    }

    if (checkOut && checkOutDate <= checkInDate) {
      setDateError('Check-out date must be after check-in date');
      return false;
    }

    setDateError('');
    return true;
  };

  const handleCheckInChange = (newCheckIn: string) => {
    setCheckInDate(newCheckIn);
    if (newCheckIn) {
      validateDates(newCheckIn, checkOutDate);
    }
  };

  useEffect(() => {
    if (checkInDate && numberOfNights && parseInt(numberOfNights as string) > 0) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + parseInt(numberOfNights as string));
      const newCheckOut = checkOut.toISOString().split('T')[0];
      setCheckOutDate(newCheckOut);
      validateDates(checkInDate, newCheckOut);
    } else if (checkInDate && checkOutDate && !numberOfNights) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setNumberOfNights(diffDays.toString());
      }
    }
  }, [checkInDate, numberOfNights, checkOutDate]);

  const handleCheckOutChange = (newCheckOut: string) => {
    setCheckOutDate(newCheckOut);
    if (checkInDate && newCheckOut) {
      if (validateDates(checkInDate, newCheckOut)) {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(newCheckOut);
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          setNumberOfNights(diffDays.toString());
        }
      }
    }
  };

  useEffect(() => {
    const newRooms = Array.from({ length: numberOfRooms }, (_, i) =>
      rooms[i] || {
        roomType: 'Double',
        adults: 1,
        adultsData: [{ name: '', surname: '' }],
        children: 0,
        childrenData: []
      }
    );
    setRooms(newRooms);
  }, [numberOfRooms]);

  const handleRoomTypeChange = (index: number, roomType: RoomType) => {
    const newRooms = [...rooms];
    newRooms[index].roomType = roomType;
    setRooms(newRooms);
  };

  const handleRoomChange = (index: number, field: 'adults' | 'children', value: number) => {
    const newRooms = [...rooms];
    newRooms[index][field] = value;

    if (field === 'adults') {
      newRooms[index].adultsData = Array.from({ length: value }, (_, i) =>
        newRooms[index].adultsData[i] || { name: '', surname: '' }
      );
    } else if (field === 'children') {
      newRooms[index].childrenData = Array.from({ length: value }, (_, i) =>
        newRooms[index].childrenData[i] || { name: '', surname: '', age: '' }
      );
    }

    setRooms(newRooms);
  };

  const handleAdultDataChange = (roomIndex: number, adultIndex: number, field: 'name' | 'surname', value: string) => {
    const newRooms = [...rooms];
    newRooms[roomIndex].adultsData[adultIndex][field] = value;
    setRooms(newRooms);
  };

  const handleChildDataChange = (roomIndex: number, childIndex: number, field: 'name' | 'surname' | 'age', value: string) => {
    const newRooms = [...rooms];
    newRooms[roomIndex].childrenData[childIndex][field] = value;
    setRooms(newRooms);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDates(checkInDate, checkOutDate)) {
      return;
    }

    setIsSubmitting(true);

    const formData = {
      agencyName,
      checkInDate,
      checkOutDate,
      numberOfNights,
      numberOfRooms,
      rooms: rooms.map((room, idx) => ({
        roomNumber: idx + 1,
        roomType: room.roomType,
        adults: room.adults,
        adultsData: room.adultsData,
        children: room.children,
        childrenData: room.childrenData
      })),
      principalGuest: rooms[0]?.adultsData[0] || { name: '', surname: '', },
      submittedAt: new Date().toISOString()
    };

    try {
      const response = await fetch('https://formspree.io/f/xblyyywv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setAgencyName('');
          setCheckInDate('');
          setNumberOfNights('');
          setCheckOutDate('');
          setNumberOfRooms(1);
          setRooms([{
            roomType: 'Double',
            adults: 1,
            adultsData: [{ name: '', surname: '' }],
            children: 0,
            childrenData: []
          }]);
          setDateError('');
        }, 3000);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-orange-600">VERISONBOOKING</span>
              </div>
              <div className="hidden md:flex space-x-4">
                <a
                  href="#"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-orange-500 hover:text-white transition-all duration-200 group"
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Main Page</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-orange-500 hover:text-white transition-all duration-200 group"
                >
                  <Grid className="w-5 h-5" />
                  <span className="font-medium">Programs</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {submitSuccess ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Reservation Completed!</h2>
            <p className="text-lg text-gray-600">Thank you for your booking! <strong>Our team will reach out to you to guide you through the next steps.</strong></p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <Building2 className="w-5 h-5 text-orange-600" />
                    <span>Agency Name</span>
                  </label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="Enter your agency name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 text-center md:text-right flex-1">
                  Hotel <span className="text-orange-600">BELMIHOUB</span> "Hammam Sokhna"
                </h1>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span>Check-in Date</span>
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => handleCheckInChange(e.target.value)}
                    min={today}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span>Number of Nights</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={numberOfNights}
                    onChange={(e) => setNumberOfNights(e.target.value)}
                    placeholder="Enter nights"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span>Check-out Date</span>
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => handleCheckOutChange(e.target.value)}
                    min={checkInDate || today}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <Building2 className="w-5 h-5 text-orange-600" />
                    <span>Number of Rooms</span>
                  </label>
                  <select
                    value={numberOfRooms}
                    onChange={(e) => setNumberOfRooms(parseInt(e.target.value))}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>

              {dateError && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {dateError}
                </div>
              )}

              <div className="border-t-2 border-gray-100 pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Room Details</h3>
                <div className="space-y-6">
                  {rooms.map((room, roomIndex) => (
                    <div key={roomIndex} className="bg-orange-50 rounded-xl p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">
                          Room {roomIndex + 1}
                          {roomIndex === 0 && <span className="ml-2 text-sm text-orange-600">(Principal Guest)</span>}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                            <DoorOpen className="w-5 h-5 text-orange-600" />
                            <span>Room Type</span>
                          </label>
                          <select
                            value={room.roomType}
                            onChange={(e) => handleRoomTypeChange(roomIndex, e.target.value as RoomType)}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors bg-white"
                          >
                            <option value="Single">Single</option>
                            <option value="Double">Double</option>
                            <option value="Triple">Triple</option>
                            <option value="Quadruple">Quadruple</option>
                            <option value="Suite">Suite</option>
                          </select>
                        </div>

                        <div>
                          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                            <Users className="w-5 h-5 text-orange-600" />
                            <span>Adults</span>
                          </label>
                          <select
                            value={room.adults}
                            onChange={(e) => handleRoomChange(roomIndex, 'adults', parseInt(e.target.value))}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors bg-white"
                          >
                            {[1, 2, 3, 4].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                            <Baby className="w-5 h-5 text-orange-600" />
                            <span>Children</span>
                          </label>
                          <select
                            value={room.children}
                            onChange={(e) => handleRoomChange(roomIndex, 'children', parseInt(e.target.value))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors bg-white"
                          >
                            {[0, 1, 2, 3, 4].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {room.adults > 0 && (
                        <div className="space-y-4">
                          <h5 className="font-semibold text-gray-900">
                            Adult{room.adults > 1 ? 's' : ''} Information
                          </h5>
                          {room.adultsData.map((adult, adultIndex) => (
                            <div key={adultIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-lg p-4">
                              <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                  <User className="w-4 h-4 text-orange-600" />
                                  <span>
                                    {roomIndex === 0 && adultIndex === 0 ? 'Principal Guest Name' : `Adult ${adultIndex + 1} Name`}
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  value={adult.name}
                                  onChange={(e) => handleAdultDataChange(roomIndex, adultIndex, 'name', e.target.value)}
                                  required
                                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                                />
                              </div>
                              <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                  <User className="w-4 h-4 text-orange-600" />
                                  <span>
                                    {roomIndex === 0 && adultIndex === 0 ? 'Principal Guest Surname' : `Adult ${adultIndex + 1} Surname`}
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  value={adult.surname}
                                  onChange={(e) => handleAdultDataChange(roomIndex, adultIndex, 'surname', e.target.value)}
                                  required
                                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {room.children > 0 && (
                        <div className="space-y-4">
                          <h5 className="font-semibold text-gray-900">Children Information</h5>
                          {room.childrenData.map((child, childIndex) => (
                            <div key={childIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-lg p-4">
                              <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                  <User className="w-4 h-4 text-orange-600" />
                                  <span>Child {childIndex + 1} Name</span>
                                </label>
                                <input
                                  type="text"
                                  value={child.name}
                                  onChange={(e) => handleChildDataChange(roomIndex, childIndex, 'name', e.target.value)}
                                  required
                                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                                />
                              </div>
                              <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                  <User className="w-4 h-4 text-orange-600" />
                                  <span>Child {childIndex + 1} Surname</span>
                                </label>
                                <input
                                  type="text"
                                  value={child.surname}
                                  onChange={(e) => handleChildDataChange(roomIndex, childIndex, 'surname', e.target.value)}
                                  required
                                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                                />
                              </div>
                              <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                  <Baby className="w-4 h-4 text-orange-600" />
                                  <span>Child {childIndex + 1} Age</span>
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="17"
                                  value={child.age}
                                  onChange={(e) => handleChildDataChange(roomIndex, childIndex, 'age', e.target.value)}
                                  required
                                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !!dateError}
                className="w-full bg-orange-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-orange-600 hover:border-2 hover:border-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-6 h-6" />
                <span>{isSubmitting ? 'Submitting...' : 'Reserver'}</span>
              </button>
            </form>
          </div>
        )}
      </main>

      <footer className="bg-white border-t-2 border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex space-x-6">
              <a
                href="https://www.facebook.com/verisontour"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-orange-600 transition-colors transform hover:scale-110 duration-200"
              >
                <Facebook className="w-7 h-7" />
              </a>
              <a
                href="https://www.instagram.com/verisontour"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-orange-600 transition-colors transform hover:scale-110 duration-200"
              >
                <Instagram className="w-7 h-7" />
              </a>
              <a
                href="https://www.tiktok.com/@verison.travel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-orange-600 transition-colors transform hover:scale-110 duration-200"
              >
                <FaTiktok className="w-7 h-7" />
              </a>
              <a
                href="https://wa.me/213555301613"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-orange-600 transition-colors transform hover:scale-110 duration-200"
              >
                <FaWhatsapp className="w-7 h-7" />
              </a>
            </div>
            <p className="text-gray-600 text-sm">© 2025 VERISON-TRAVEL All rights reserved. | Developed by <a href="https://zedlink.netlify.app/" target="_blank" rel="zed-link solution website"><strong>ZED-LINK Solution.</strong></a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
