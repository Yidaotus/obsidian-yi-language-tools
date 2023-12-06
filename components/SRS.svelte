<script lang="ts">
	import type { Vocab } from "main";
	type CardItem = {
		value: string;
		spelling?: string;
	};
	type CardVocab = {
		front: CardItem;
		back: CardItem;
	};

	type SRSState = "splash" | "front" | "back";

	export let cards: Array<Vocab>;
	let activeCards: Array<CardVocab> = [];
	let srsCardLength = 0;
	let activeCardIndex = 0;
	let srsState: SRSState = "splash";
	let includeReverseCards = false;

	export const reset = () => {
		srsState = "splash";
	};

	let srsStart = () => {
		activeCards = cards.map((vocab) => ({
			front: {
				value: vocab.front,
				spelling: vocab.spelling,
			},
			back: {
				value: vocab.back,
			},
		}));
		if (includeReverseCards) {
			activeCards = [
				...activeCards,
				...cards.map((vocab) => ({
					front: { value: vocab.back },
					back: { value: vocab.front, spelling: vocab.spelling },
				})),
			];
		}
		srsCardLength = activeCards.length;
		srsState = "front";
	};

	let srsReveal = () => {
		srsState = "back";
	};

	let srsStep = (known: boolean) => () => {
		console.log({ activeCards, activeCardIndex });
		if (known) {
			activeCards = activeCards.filter((_, i) => i !== activeCardIndex);
		}
		if (activeCards.length < 1) {
			srsState = "splash";
		} else {
			shuffle();
			srsState = "front";
		}
		console.log({ activeCards, activeCardIndex });
	};

	let shuffle = () => {
		let newIndex = activeCardIndex;
		let failSafe = 5;
		while (newIndex === activeCardIndex && failSafe-- > 0) {
			newIndex = Math.floor(Math.random() * (activeCards.length - 1));
		}
		activeCardIndex = newIndex;
	};

	$: activeFront = activeCards[activeCardIndex]?.front || {
		value: "",
		spelling: "",
	};
	$: activeBack = activeCards[activeCardIndex]?.back || {
		value: "",
		spelling: "",
	};
	$: progressBarWidth = 1 - activeCards.length / srsCardLength;
</script>

<div class="container">
	<div class="card">
		{#if srsState === "front" || srsState === "back"}
			<div
				class="srs-progress-bar"
				style:width="{progressBarWidth * 100}%"
			/>
		{/if}
		{#if srsState === "splash"}
			<div class="title">{cards.length} cards to learn!</div>
			<label>
				<input type="checkbox" bind:checked={includeReverseCards} />
				Include Reverse Cards
			</label>
		{/if}
		{#if srsState === "front" || srsState === "back"}
			<div class="item front">
				{#if activeFront.spelling}
					<ruby>
						{activeFront.value}<rt>{activeFront.spelling}</rt>
					</ruby>
				{:else}
					{activeFront.value}
				{/if}
			</div>
		{/if}
		{#if srsState === "back"}
			<div class="divider" />
			<div class="item back">
				{#if activeBack.spelling}
					<ruby>
						{activeBack.value}<rt>{activeBack.spelling}</rt>
					</ruby>
				{:else}
					{activeBack.value}
				{/if}
			</div>
		{/if}
	</div>
	<div class="button-container">
		{#if srsState === "splash"}
			<button class="button" on:click={srsStart}>Start SRS</button>
		{/if}
		{#if srsState === "front"}
			<button class="button" on:click={srsReveal}>Reveal</button>
		{/if}
		{#if srsState === "back"}
			<button class="button" on:click={srsStep(true)}>Good</button>
			<button class="button" on:click={srsStep(false)}>Bad</button>
		{/if}
	</div>
</div>

<style>
	.title {
		font-size: 1.5rem;
		padding-bottom: 2rem;
	}
	.button {
		flex: 1;
	}
	.button-container {
		display: flex;
		gap: 12px;
		margin-top: auto;
		width: 100%;
	}
	.item {
		display: flex;
		width: 100%;
		justify-content: center;
		align-items: center;
	}
	.srs-progress-bar {
		transition: width 0.2s;
		transition-timing-function: ease-out;
		position: absolute;
		top: 0px;
		left: 0px;
		border-style: solid;
		border-color: #82e39a;
		border-radius: 1rem;
		border-width: 8px;
		height: 8px;
	}
	.divider {
		width: 100%;
		border-style: solid;
		border-color: "#ffffff10";
		border-width: 1px;
		padding-right: 12px;
		padding-left: 12px;
		margin-top: 24px;
		margin-bottom: 24px;
	}
	.front {
		font-size: 3rem;
	}
	.back {
		font-size: 2rem;
	}
	.card {
		text-align: center;
		height: 100%;
		display: flex;
		padding: 12px;
		flex-direction: column;
		flex: 1;
		width: 100%;
		justify-content: center;
		align-items: center;
	}
	.container {
		height: 100%;
		display: flex;
		padding: 12px;
		flex-direction: column;
		width: 100%;
		justify-content: center;
		align-items: center;
	}
</style>
