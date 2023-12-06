<script lang="ts">
	import type { Vocab } from "main";

	export let cards: Array<Vocab>;
	let activeCardindex = 0;

	let shuffle = () => {
		let newIndex = activeCardindex;
		let failSafe = 5;
		while (newIndex === activeCardindex && failSafe-- > 0) {
			newIndex = Math.floor(Math.random() * (cards.length - 1));
		}
		activeCardindex = newIndex;
	};

	$: activeFront = cards[activeCardindex]?.front || "Unloaded";
	$: activeBack = cards[activeCardindex]?.back || "Unloaded";
	$: activeSpelling = cards[activeCardindex]?.spelling || "Unloaded";
</script>

<div class="container">
	<div>YOU have to learn {cards.length} cards!</div>
	<div class="card">
		<div class="item">
			Front: {activeFront}
		</div>
		<div class="item">
			Back: {activeBack}
		</div>
		<div class="item">
			Spelling: {activeSpelling}
		</div>
	</div>
	<button class="button" on:click={shuffle}>Next</button>
</div>

<style>
	.button {
		margin-top: auto;
		width: 100%;
	}
	.item {
		display: flex;
		width: 100%;
		justify-content: center;
		align-items: center;
	}
	.card {
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
