import { Component, OnInit, NgZone, Renderer2, ElementRef,
  AfterContentInit,ViewChild, OnDestroy } from '@angular/core';
  import { Subscription } from 'rxjs';
  import { MapService } from 'src/app/services/map.service';
  declare var google: any;
  
  @Component({
    selector: 'app-google-map',
    templateUrl: './google-map.component.html',
    styleUrls: ['./google-map.component.css']
  })
  
  export class GoogleMapComponent implements AfterContentInit, OnInit, OnDestroy {
    map: google.maps.Map;
    subscription: Subscription;
    locDetSubscription: Subscription;
    @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;
    private autocomplete: google.maps.places.Autocomplete;
    public searchAddress: string = '';
    private marker: google.maps.Marker;
    private infoWindow: google.maps.InfoWindow;
    private locationDetail:object = null;
  
  constructor(private mapService: MapService, private el: ElementRef,
  private ngZone: NgZone){}
  
  ngOnInit(): void {
    // this.mapService.initializeMap(this.el.nativeElement.querySelector('#map'));
    this.marker = this.mapService.getMarker();
    this.initAutocomplete();
  
   this.subscription =
  this.mapService.locationNameUpdated.subscribe((locationName: string)=> {
            // console.log(locationName);
              this.searchAddress = locationName;
          });
   this.locDetSubscription = this.mapService.locationDetailUpdated.subscribe((locationDetail:Object)=> {
                          this.locationDetail = locationDetail
          }); 
  
      // Create infoWindow with a custom content
      this.infoWindow = new google.maps.InfoWindow({
        content: `
        <div>
        <div class="text-primary fw-bold mb-2" style="font-size:
  17px">Your laundry will be picked-up here</div>
        <div class="text-muted">Please move the map to adjust your location</div>
         </div>
        `
      })
  }
  
  ngAfterContentInit(): void {
    this.mapService.initializeMap(this.el.nativeElement.querySelector('#map'));
    this.map = this.mapService.getMap();
    this.marker = this.mapService.getMarker();
  }
  
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.mapService.setMapCenter(userLocation.lat, userLocation.lng);
          this.mapService.setMapZoomLevel(18);
          this.infoWindow.open(this.map, this.marker);
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }
  
  private initAutocomplete(): void {
      this.autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('searchInput') as HTMLInputElement,
        {
          types: ['geocode'] // Specify the type of place data to return
        }
      );
  
      this.autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place: google.maps.places.PlaceResult =
  this.autocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
            // Handle the selected place here
            // console.log(place);
            const location = place.geometry.location;
            this.mapService.setMapCenter(location.lat(), location.lng());
            this.mapService.setMapZoomLevel(18);
            this.infoWindow.open(this.map, this.marker);
          } else {
            console.error('Invalid place selected:', place);
          }
        });
      });
    }
  
  
  
  searchPlaces(query: string): void {
    const placesService = this.mapService.getPlacesService();
  
    const request = {
      query: query,
      fields: ['name', 'geometry']
    };
  
    placesService.findPlaceFromQuery(request, (results, status) => {
      if (status === 'OK' && results && results[0].geometry) {
        const location = results[0].geometry.location;
        this.mapService.setMapCenter(location.lat(), location.lng());
      } else {
        console.error('Error searching for places:', status);
      }
    });
  }
  
  
  onSearchInputClick(): void {
    // Clear the input field when clicked
    this.searchAddress = '';
  }
  
  pickupLocation(){
    if(this.searchAddress && this.locationDetail){
      console.log(this.searchAddress);
    // console.log(this.locationDetail);
    const location = this.getAddressComponents(this.locationDetail);
    console.log(location);
    }
  
  }
  
   getAddressComponents(data) {
    const result = {
      fullAddress: '',
      // address: '',
      pincode: '',
      city: '',
      state: '',
      country: '',
      lat:0,
      lng:0
    };
  
    result.fullAddress = data.formatted_address;
  
    data.address_components.forEach(component => {
      const types = component.types;
      // if (types.includes('street_number')) {
      //   result.address += component.long_name + ', ';
      // } else if (types.includes('route')) {
      //   result.address += component.long_name + ', ';
      // }
       if (types.includes('locality')) {
        result.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) { 
        result.state = component.long_name;
      } else if (types.includes('postal_code')) { 
        result.pincode = component.long_name;
      } else if (types.includes('country')) {
        result.country = component.long_name;
      } 
    });

    const latLng = this.marker.getPosition();
    result.lat = latLng.lat();
    result.lng = latLng.lng();

  
    // Removing trailing comma and space from the address
    // result.address = result.address.replace(/, /, "");
  
    return result;
  } 
  
  
  ngOnDestroy(): void {
  
    this.subscription.unsubscribe();
    this.locDetSubscription.unsubscribe();
  }
  
  }