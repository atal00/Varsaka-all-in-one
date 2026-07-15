import { useParams } from 'react-router-dom';
import Login from './Login';
import Fake404 from './Fake404';

export default function TimeBasedLogin() {
  const { accessCode } = useParams();

  const getCodesForDate = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    const DD = pad(date.getDate());
    const MM = pad(date.getMonth() + 1);
    const YYYY = date.getFullYear();
    const H24 = pad(date.getHours());
    const H12 = pad(date.getHours() % 12 || 12);
    const MIN = pad(date.getMinutes());

    return [
      `${DD}${MM}${YYYY}${H24}${MIN}`,
      `${DD}${MM}${YYYY}${H12}${MIN}`
    ];
  };

  const now = new Date();

  const validCodes = [
    ...getCodesForDate(now)
  ];

  // If the URL matches the current Date-Time format (e.g. 120720260452)
  if (validCodes.includes(accessCode)) {
    return <Login />;
  }

  // Otherwise, it acts exactly like a 404 page
  return <Fake404 />;
}
