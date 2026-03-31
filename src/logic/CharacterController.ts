import { CharacterSpineView } from '../views/character/CharacterSpineView';

export class CharacterController {
  constructor(private readonly characterView: CharacterSpineView | null) {}

  handleSpinResolved = (result: { hasWin: boolean }): void => {
    if (!this.characterView || !result.hasWin) return;
    this.characterView.playWinReaction();
  };

  handleBonusEntered = (): void => {
    this.characterView?.playBonusEnterReaction();
  };
}
