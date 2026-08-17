import { Component, input, output } from '@angular/core';
import { CharacterModel } from '@features/game-guides/character/models/character-model';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';

@Component({
  selector: 'app-character-list-component',
  imports: [
    DatePipe,
    NgOptimizedImage,
    ButtonComponent,
    LoadingComponent
  ],
  templateUrl: './character-list-component.html',
})
export class CharacterListComponent {
  readonly isLoading = input<boolean>(false);
  readonly characterList = input<CharacterModel[]>([]);
  protected readonly edit = output<CharacterModel>();
  protected readonly delete = output<CharacterModel>();
}
