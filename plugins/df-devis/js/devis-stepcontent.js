class StepContent {
	constructor(name, index) {
		this.name = name;
		this.index = index;
	}
}

class OptionContent extends StepContent {
	constructor(name, index) {
		super(name, index);
		this.options = [];
	}

	add(name, group) {
		this.options.push({ name, group });
	}

	removeByIndex(index) {
		if (index >= 0 && index < this.options.length) {
			this.options.splice(index, 1);
		}
	}

	removeByName(name) {
		this.options = this.options.filter(opt => opt.name !== name);
	}

	removeByGroup(group) {
		this.options = this.options.filter(opt => opt.group !== group);
	}
}

class HistoryContent extends StepContent {
	constructor(name, index) {
		super(name, index);
	}
}

class FormulaireContent extends StepContent {
	constructor(name, index) {
		super(name, index);
	}
}