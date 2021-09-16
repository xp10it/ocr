$(document).ready(function () {
	$('#selected-image').addClass('hidden');
	$('#log').addClass('hidden');
	let inputs = document.querySelectorAll('.inputfile');
	Array.prototype.forEach.call(inputs, function (input) {
		let label = input.nextElementSibling,
			labelVal = label.innerHTML;

		input.addEventListener('change', function (e) {
			let fileName = '';
			if (this.files && this.files.length > 1)
				fileName = (this.getAttribute('data-multiple-caption') || '').replace(
					'{count}',
					this.files.length
				);
			else fileName = e.target.value.split('\\').pop();

			if (fileName) {
				label.querySelector('span').innerHTML = fileName;

				let reader = new FileReader();
				reader.onload = function () {
					let dataURL = reader.result;
					$('#selected-image').attr('src', dataURL);
				};
				let file = this.files[0];
				reader.readAsDataURL(file);
				startRecognize(file);
			} else {
				label.innerHTML = labelVal;
				$('#selected-image').attr('src', '');
				$('#selected-image').removeClass('col-12');
				$('#arrow-right').addClass('fa-arrow-right');
				$('#arrow-right').removeClass('fa-check');
				$('#arrow-right').removeClass('fa-spinner fa-spin');
				$('#arrow-down').addClass('fa-arrow-down');
				$('#arrow-down').removeClass('fa-check');
				$('#arrow-down').removeClass('fa-spinner fa-spin');
				$('#log').empty();
			}
		});

		// Firefox bug fix
		input.addEventListener('focus', function () {
			input.classList.add('has-focus');
		});
		input.addEventListener('blur', function () {
			input.classList.remove('has-focus');
		});
	});
});

$('#startLink').click(function () {
	let img = document.getElementById('selected-image');
	startRecognize(img);
});

function startRecognize(img) {
	$('#arrow-right').removeClass('fa-arrow-right');
	$('#arrow-right').addClass('fa-spinner fa-spin');
	$('#arrow-down').removeClass('fa-arrow-down');
	$('#arrow-down').addClass('fa-spinner fa-spin');
	$('#selected-image').removeClass('hidden');
	$('#log').removeClass('hidden');
	recognizeFile(img);
}

function progressUpdate(packet) {
	let log = document.getElementById('log');

	if (log.firstChild && log.firstChild.status === packet.status) {
		if ('progress' in packet) {
			let progress = log.firstChild.querySelector('progress');
			progress.value = packet.progress;
		}
	} else {
		let line = document.createElement('div');
		line.status = packet.status;
		let status = document.createElement('div');
		status.className = 'status';
		status.appendChild(document.createTextNode(packet.status));
		line.appendChild(status);

		if ('progress' in packet) {
			let progress = document.createElement('progress');
			progress.value = packet.progress;
			progress.max = 1;
			line.appendChild(progress);
		}

		if (packet.status == 'done') {
			log.innerHTML = '';
			let pre = document.createElement('pre');
			pre.appendChild(
				document.createTextNode(packet.data.text.replace(/\n\s*\n/g, '\n'))
			);
			line.innerHTML = '';
			line.appendChild(pre);
			$('.fas').removeClass('fa-spinner fa-spin');
			$('.fas').addClass('fa-check');
		}

		log.insertBefore(line, log.firstChild);
	}
}

function recognizeFile(file) {
	$('#log').empty();
	const corePath =
		window.navigator.userAgent.indexOf('Edge') > -1
			? 'js/tesseract-core.asm.js'
			: 'js/tesseract-core.wasm.js';

	const worker = new Tesseract.TesseractWorker({
		corePath,
	});

	worker
		.recognize(file, $('#langsel').val())
		.progress(function (packet) {
			console.info(packet);
			progressUpdate(packet);
		})
		.then(function (data) {
			console.log(data);
			progressUpdate({ status: 'done', data: data });
		});
}
