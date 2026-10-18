
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface EventWeather {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number;
  weatherCode: number;
  description: string;
}

interface OpenMeteoResponse {
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://api.open-meteo.com/v1/forecast';

  getEventWeather(
    latitude: number,
    longitude: number,
    eventDate: string
  ): Observable<EventWeather | null> {
    const params = new HttpParams()
      .set('latitude', latitude)
      .set('longitude', longitude)
      .set('daily',
        'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code')
      .set('timezone', 'auto')
      .set('forecast_days', '16');

    return this.http.get<OpenMeteoResponse>(
      this.apiUrl,
      { params }
    ).pipe(
      map(response => {
        const daily = response.daily;

        if (!daily) {
          return null;
        }

        const date = eventDate.slice(0, 10);
        const index = daily.time.indexOf(date);

        if (index === -1) {
          return null;
        }

        return {
          date,
          temperatureMax: daily.temperature_2m_max[index],
          temperatureMin: daily.temperature_2m_min[index],
          precipitationProbability:
            daily.precipitation_probability_max[index],
          weatherCode: daily.weather_code[index],
          description: this.describeWeather(
            daily.weather_code[index]
          )
        };
      })
    );
  }

  private describeWeather(code: number): string {
    if (code === 0) return 'Clear sky';
    if ([1, 2, 3].includes(code)) return 'Partly cloudy';
    if ([45, 48].includes(code)) return 'Foggy';
    if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
    if ([61, 63, 65, 66, 67].includes(code)) return 'Rainy';
    if ([71, 73, 75, 77].includes(code)) return 'Snowy';
    if ([80, 81, 82].includes(code)) return 'Rain showers';
    if ([85, 86].includes(code)) return 'Snow showers';
    if ([95, 96, 99].includes(code)) return 'Thunderstorm';
    return 'Unknown conditions';
  }
}
