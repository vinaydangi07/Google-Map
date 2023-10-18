import { HttpClient } from '@angular/common/http';
import { Injectable,  } from '@angular/core';
import { BehaviorSubject,} from 'rxjs';

declare var google: any;

@Injectable({
  providedIn: 'root'
}) 

export class MapService {
 private map: google.maps.Map;
 private marker: google.maps.Marker;
 private placesService: google.maps.places.PlacesService ;
  

locationNameUpdated: BehaviorSubject<string> = new BehaviorSubject<string>('');
locationDetailUpdated: BehaviorSubject<object> = new BehaviorSubject<object>(null)

  constructor(private http: HttpClient){}

  initializeMap(mapElement: HTMLElement): void {
    this.map = new google.maps.Map(mapElement, {
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 13,
    });

    this.placesService = new google.maps.places.PlacesService(this.map);

    this.marker = new google.maps.Marker({
      position: this.map.getCenter(),
      map: this.map,
      draggable: false,
      
    });

   
    


    google.maps.event.addListener(this.map, 'center_changed', () => {
      const newCenter = this.map.getCenter();
      this.marker.setPosition(newCenter);
      this.updateLocationInfo(newCenter.lat(), newCenter.lng());
    });


   
  }

  setMapCenter(lat: number, lng: number): void {
    this.map.setCenter({ lat, lng });
    this.marker.setPosition({ lat, lng });
    this.updateLocationInfo(lat, lng);
  }

  private updateLocationInfo(lat: number, lng: number): void {
    const geocoder = new google.maps.Geocoder();
    const latLng = new google.maps.LatLng(lat, lng);

    geocoder.geocode({ 'location': latLng }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          const address = results[0].formatted_address;
          this.locationNameUpdated.next(address);

          const detailAdress = results[0];

          this.locationDetailUpdated.next(detailAdress)
        } else {
          this.locationNameUpdated.next('Address not found');
        }
      } else {
        this.locationNameUpdated.next('Error fetching address');
      }
    });
  }


  getMap(): google.maps.Map {
    return this.map;
  }

  getMarker(): google.maps.Marker {
    return this.marker;
  }

  getPlacesService(): google.maps.places.PlacesService {
    return this.placesService;
  };

  isMarkerSet(): boolean {
    return !!this.marker;
  }

  setMapZoomLevel(zoomLevel: number){
      this.map.setZoom(zoomLevel)
  }
}

